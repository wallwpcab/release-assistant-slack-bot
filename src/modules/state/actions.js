const { stateReadView } = require('./views')
const { Config } = require('./mappings')
const { sendMessageOverUrl } = require('../slack/integration')
const { readState, updateState } = require('../../bot-state')
const { getConfigData } = require('../../transformer')

const handleIfEditDialogAction = async ({ callback_id, response_url, submission }) => {
  if (callback_id !== Config.callback_id) return

  let state = getConfigData(submission)
  await updateState(state, true)
  state = await readState()
  return sendMessageOverUrl(response_url, stateReadView(state))
}

module.exports = {
  handleIfEditDialogAction
}
