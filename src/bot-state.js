const { mergeDeepRight, mergeRight, isEmpty } = require('ramda')

const { readStore, writeStore } = require('./persistence')

const readState = async () => readStore()

const updateState = async (state, overwrite = false) => {
  const currentValue = await readState()

  let updatedValue
  if (overwrite) {
    updatedValue = isEmpty(state) ? {} : mergeRight(currentValue, state)
  } else {
    updatedValue = mergeDeepRight(currentValue, state)
  }

  await writeStore(updatedValue)
}

module.exports = {
  readState,
  updateState
}
