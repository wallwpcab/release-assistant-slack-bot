const { mergeDeepLeft, mergeRight } = require('ramda');

const { readStore, writeStore } = require('./persistence');

const readConfig = async () => {
  return readStore();
}

const updateConfig = async (config, overwrite = false) => {
  const currentValue = await readConfig();
  const updatedValue = overwrite ? mergeRight(currentValue, config) : mergeDeepLeft(currentValue, config)
  return writeStore(updatedValue);
}

module.exports = {
  readConfig,
  updateConfig
}
