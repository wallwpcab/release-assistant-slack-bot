const fs = require('fs');

const fileName = __dirname + '/store.json';

const readStore = () => new Promise((resolve) => {
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) return resolve({});
    resolve(JSON.parse(data));
  });
})

const writeStore = (document) => new Promise((resolve, reject) => {
  fs.writeFile(fileName, JSON.stringify(document), "utf8", (err) => {
    if (err) return reject(err);
    resolve(document);
  });
})

module.exports = {
  readStore,
  writeStore
}
