const { Config } = require('./mappings')
const { configReadView } = require('./views')
const { postMessage } = require('../slack/integration')
const { readConfig, updateConfig } = require('../../bot-config')
const { getConfigData } = require('../../transformer')

const handleIfEditDialogAction = async ({ callback_id, response_url, submission }) => {
  if (callback_id !== Config.callback_id) return

  const config = getConfigData(submission)
  await updateConfig(config, true)
  const updatedConfig = await readConfig()
  return postMessage(response_url, configReadView(updatedConfig))
}

module.exports = {
  handleIfEditDialogAction
}
