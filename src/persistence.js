const fs = require('fs')

const fileName = `${__dirname}/state.json`

const readStore = () => new Promise((resolve) => {
  fs.readFile(fileName, 'utf8', (err, content) => {
    if (err) return resolve({})
    return resolve(JSON.parse(content))
  })
})

const writeStore = document => new Promise((resolve, reject) => {
  const content = JSON.stringify(document, null, 2)
  fs.writeFile(fileName, content, 'utf8', (err) => {
    if (err) return reject(err)
    return resolve(document)
  })
})

module.exports = {
  readStore,
  writeStore
}
