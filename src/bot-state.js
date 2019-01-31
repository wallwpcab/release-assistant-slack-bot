const { mergeDeepRight, mergeRight, isEmpty } = require('ramda')

const { readStore, writeStore } = require('./persistence')

const readState = async () => {
  return readStore()
}

const updateState = async (config, overwrite = false) => {
  const currentValue = await readState()

  let updatedValue
  if(overwrite) {
    updatedValue = isEmpty(config) ? {} : mergeRight(currentValue, config)
  } else {
    updatedValue = mergeDeepRight(currentValue, config)
  }

  await writeStore(updatedValue)
}

module.exports = {
  readState,
  updateState
}
