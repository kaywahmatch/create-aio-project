import * as fs from 'node:fs'
import degit from 'degit'

function emitter(_projectName) {
  const emitter = degit('kaywahmatch/create-project-template/vue-ts-router-pinia', {
    cache: true,
    force: true,
    verbose: true
  })

  emitter.on('info', (info) => {
    console.log(info.message)
  })

  emitter.clone(_projectName).then(() => {
    console.log('done')
    fs.readFile(`./${_projectName}/README.md`, function (err, data) {
      if (err) {
        return console.error(err)
      }
      console.log('异步读取: ' + data.toString())
    })
  })
  console.log(`is init successfully`)
}

export { emitter }
