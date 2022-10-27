#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

import minimist from 'minimist'
import prompts from 'prompts'
import { red, green, bold } from 'kolorist'

import banner from './utils/banner'
import { canSkipEmptying, emptyDir, isValidPackageName, toValidPackageName } from './utils/package'

import { emitter } from './utils/templateEmitter'

let _result: {
  projectName?: string
  templateType?: string
}

async function init() {
  console.log(`\n${banner}\n`)

  const cwd = process.cwd()
  // possible options:
  // --default
  // --typescript / --ts
  // --jsx
  // --router / --vue-router
  // --pinia
  // --with-tests / --tests (equals to `--vitest --cypress`)
  // --vitest
  // --cypress
  // --playwright
  // --eslint
  // --eslint-with-prettier (only support prettier through eslint for simplicity)
  // --force (for force overwriting)

  //   获取命令行参数
  const argv = minimist(process.argv.slice(2), {
    alias: {
      typescript: ['ts'],
      'with-tests': ['tests'],
      router: ['vue-router']
    },
    // all arguments are treated as booleans
    boolean: true
  })
  console.log('🚀 ~ file: index.ts ~ line 48 ~ argv ~ argv', argv)

  // 输入的命令行参数里，是否有匹配对应预设值的功能，有就跳过询问功能直接安装
  const isFeatureFlagsUsed = typeof (argv.default ?? argv['vue-ts-router-pinia']) === 'boolean'
  console.log('🚀 ~ file: index.ts ~ line 51 ~ init ~ isFeatureFlagsUsed', isFeatureFlagsUsed)

  let targetDir = argv._[0]
  const defaultProjectName = !targetDir ? 'vue-project' : targetDir

  const forceOverwrite = argv.force

  let result: {
    projectName?: string
    shouldOverwrite?: boolean
    packageName?: string
    templateType?: string
  } = {}

  try {
    // 弹出命令行填写参数
    result = await prompts(
      [
        {
          name: 'projectName',
          type: targetDir ? null : 'text',
          message: 'Project name:',
          initial: defaultProjectName,
          onState: (state) => (targetDir = String(state.value).trim() || defaultProjectName)
        },
        {
          name: 'shouldOverwrite',
          type: () => (canSkipEmptying(targetDir) || forceOverwrite ? null : 'confirm'),
          message: () => {
            const dirForPrompt =
              targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`

            return `${dirForPrompt} is not empty. Remove existing files and continue?`
          }
        },
        {
          name: 'overwriteChecker',
          type: (prev, values) => {
            if (values.shouldOverwrite === false) {
              throw new Error(red('✖') + ' Operation cancelled')
            }
            return null
          }
        },
        {
          name: 'packageName',
          type: () => (isValidPackageName(targetDir) ? null : 'text'),
          message: 'Package name:',
          initial: () => toValidPackageName(targetDir),
          validate: (dir) => isValidPackageName(dir) || 'Invalid package.json name'
        },
        {
          name: 'templateType',
          type: () => (isFeatureFlagsUsed ? null : 'select'),
          message: 'Select template needed?',
          initial: 0,
          choices: (prev, answers) => [
            {
              title: 'vue-ts-router-pinia',
              value: 'vue-ts-router-pinia'
            },
            {
              title: 'vite-js-tailwind',
              value: 'vite-template'
            }
          ]
        }
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled')
        }
      }
    )
  } catch (cancelled) {
    process.exit(1)
  }

  const {
    projectName,
    packageName = projectName ?? defaultProjectName,
    shouldOverwrite = argv.force,
    // needsJsx = argv.jsx,
    // needsTypeScript = argv.typescript,
    // needsRouter = argv.router,
    // needsPinia = argv.pinia,
    // needsVitest = argv.vitest || argv.tests,
    // needsEslint = argv.eslint || argv['eslint-with-prettier'],
    // needsPrettier = argv['eslint-with-prettier']
    templateType = argv.templateType
  } = result

  _result = {
    projectName,
    templateType
  }

  //   路径
  const root = path.join(cwd, targetDir)

  if (fs.existsSync(root) && shouldOverwrite) {
    emptyDir(root)
  }
  // else if (!fs.existsSync(root)) {
  //   fs.mkdirSync(root)
  // }

  return result
}

// 初始化
init()
  .then((res) => {
    const { projectName, templateType } = res
    console.log('🚀 ~ file: index.ts ~ line 183 ~ .then ~ res', res)

    // emitter(projectName, templateType)
  })
  .catch((e) => {
    console.error(e)
  })
