#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

import minimist from 'minimist'
import prompts from 'prompts'
import { red, green, bold } from 'kolorist'

import banner from './utils/banner'
import { canSkipEmptying, emptyDir, isValidPackageName, toValidPackageName } from './utils/package'

async function init() {
  console.log(`\n${banner}\n`)

  const cwd = process.cwd()
  console.log('🚀 ~ file: index.ts ~ line 16 ~ init ~ cwd', cwd)
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
  console.log('🚀 ~ file: index.ts ~ line 40 ~ argv ~ argv', argv, process.argv)

  // 输入的命令行参数里，是否有匹配对应预设值的功能，有就跳过询问功能直接安装
  const isFeatureFlagsUsed =
    typeof (
      argv.default ??
      argv.ts ??
      argv.jsx ??
      argv.router ??
      argv.pinia ??
      argv.tests ??
      argv.vitest ??
      argv.cypress ??
      argv.playwright ??
      argv.eslint
    ) === 'boolean'

  console.log('🚀 ~ file: index.ts ~ line 45 ~ init ~ isFeatureFlagsUsed', isFeatureFlagsUsed)

  let targetDir = argv._[0]
  console.log('🚀 ~ file: index.ts ~ line 61 ~ init ~ targetDir', targetDir)
  const defaultProjectName = !targetDir ? 'vue-project' : targetDir
  console.log('🚀 ~ file: index.ts ~ line 62 ~ init ~ defaultProjectName', defaultProjectName)

  const forceOverwrite = argv.force
  console.log('🚀 ~ file: index.ts ~ line 65 ~ init ~ forceOverwrite', forceOverwrite)

  let result: {
    projectName?: string
    shouldOverwrite?: boolean
    packageName?: string
    needsTypeScript?: boolean
    needsJsx?: boolean
    needsRouter?: boolean
    needsPinia?: boolean
    needsVitest?: boolean
    needsE2eTesting?: false | 'cypress' | 'playwright'
    needsEslint?: boolean
    needsPrettier?: boolean
  } = {}
  console.log('🚀 ~ file: index.ts ~ line 81 ~ init ~ result', result)

  try {
    // 弹出命令行填写参数
    result = await prompts([
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
        name: 'needsTypeScript',
        type: () => (isFeatureFlagsUsed ? null : 'toggle'),
        message: 'Add TypeScript?',
        initial: false,
        active: 'Yes',
        inactive: 'No'
      }
    ])
    console.log('🚀 ~ file: index.ts ~ line 85 ~ init ~ result', result)
  } catch (cancelled) {
    console.log(cancelled.message)
    process.exit(1)
  }

  // `initial` won't take effect if the prompt type is null
  // so we still have to assign the default values here
  const {
    projectName,
    packageName = projectName ?? defaultProjectName,
    shouldOverwrite = argv.force,
    needsJsx = argv.jsx,
    needsTypeScript = argv.typescript,
    needsRouter = argv.router,
    needsPinia = argv.pinia,
    needsVitest = argv.vitest || argv.tests,
    needsEslint = argv.eslint || argv['eslint-with-prettier'],
    needsPrettier = argv['eslint-with-prettier']
  } = result

  //   路径
  const root = path.join(cwd, targetDir)
  console.log('🚀 ~ file: index.ts ~ line 137 ~ init ~ root', root)

  if (fs.existsSync(root) && shouldOverwrite) {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  console.log(`\nScaffolding project in ${root}...`)
}

// 初始化
init()
  .then(() => {
    console.log(`is init successfully`)
  })
  .catch((e) => {
    console.error(e)
  })
