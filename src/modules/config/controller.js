const minimist = require('minimist')

const { configReadView, configDialogView } = require('./views')
const { openDialog } = require('../slack/integration')
const { readConfig } = require('../../bot-config')
const { splitValues } = require('../../utils')
const log = require('../../utils/log')

const configPost = async (req, res) => {
  const { text } = req.body
  try {
    const args = minimist(splitValues(text))
    handleIfReadConfig(args, res)
    handleIfUpdateConfig(args, res, req)
  } catch (err) {
    log.error('handleIfUpdateConfig() > openDialog failed', err)
    res.sendStatus(500)
  }
}

const handleIfReadConfig = async (args, res) => {
  if (args.update) return

  const config = await readConfig()
  res.send(configReadView(config))
}

const handleIfUpdateConfig = async (args, res, req) => {
  if (!args.update) return

  const config = await readConfig()
  const {
    deployChannel = config.deployChannel,
    botChannel = config.botChannel,
  } = args

  const configValue = JSON.stringify({
    ...config,
    deployChannel,
    botChannel
  }, null, 2)

  const { trigger_id } = req.body

  await openDialog(trigger_id, configDialogView(configValue))
  res.send()
}

module.exports = {
  configPost
}
