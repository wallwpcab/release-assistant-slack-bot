const {
  stateReadView
} = require('./views')
const {
  Config
} = require('./mappings')
const {
  sendMessageOverUrl
} = require('../slack/integration')
const {
  readState,
  updateState
} = require('../../bot-state')
const {
  getConfigData
} = require('../../transformer')

const handleIfEditDialogAction = async ({
  callback_id: callbackId,
  response_url: responseUrl,
  submission
}) => {
  if (callbackId !== Config.callback_id) return

  let state = getConfigData(submission)
  await updateState(state, true)
  state = await readState()
  await sendMessageOverUrl(responseUrl, stateReadView(state))
}

module.exports = {
  handleIfEditDialogAction
}
