let store = {}
const readStore = () => store

const writeStore = value => {
  store = value
  return store
}

module.exports = {
  readStore,
  writeStore
}
