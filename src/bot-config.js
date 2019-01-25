const { mergeDeepRight, mergeRight } = require('ramda')

const { readStore, writeStore } = require('./persistence')

const readConfig = async () => {
  return readStore()
}

const updateConfig = async (config, overwrite = false) => {
  const currentValue = await readConfig()

  let updatedValue
  if(overwrite) {
    updatedValue = Object.keys(config).length ? mergeRight(currentValue, config) : {}
  } else {
    updatedValue = mergeDeepRight(currentValue, config)
  }

  await writeStore(updatedValue)
}

module.exports = {
  readConfig,
  updateConfig
}
