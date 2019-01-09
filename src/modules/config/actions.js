const { configMapping } = require('./mappings');
const { configReadView } = require('./views');
const { sendMessage } = require('../slack/integration');
const { updateConfig } = require('../../bot-config');
const { getConfigData } = require('../../transformer');

const handleIfEditDialogAction = async ({ callback_id, response_url, submission }) => {
  if (callback_id !== configMapping.callback_id) return

  const config = getConfigData(submission);
  const updatedConfig = await updateConfig(config, true);
  return sendMessage(response_url, configReadView(updatedConfig))
}

module.exports = {
  handleIfEditDialogAction
}
