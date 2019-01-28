const { configReadView } = require('../../config/views')
const { Config } = require('../../config/mappings')
const { sendMessageOverUrl } = require('../../slack/integration')
const { readConfig, updateConfig } = require('../../../bot-config')
const { getConfigData } = require('../../../transformer')

const handleIfEditDialogAction = async ({ callback_id, response_url, submission }) => {
  if (callback_id !== Config.callback_id) return

  const config = getConfigData(submission)
  await updateConfig(config, true)
  const updatedConfig = await readConfig()
  return sendMessageOverUrl(response_url, configReadView(updatedConfig))
}

module.exports = {
  handleIfEditDialogAction
}
