const minimist = require('minimist')

const { openDialog } = require('../slack/integration')
const { readState } = require('../../bot-state')
const { splitValues, getSlackChannel } = require('../../utils')
const { stateReadView, stateDialogView } = require('./views')
const log = require('../../utils/log')

const statePost = async (req, res) => {
  const { text } = req.body
  try {
    const args = minimist(splitValues(text))
    handleIfReadConfig(args, res)
    handleIfUpdateConfig(args, res, req)
  } catch (err) {
    log.error('configPost > failed', err)
    res.sendStatus(500)
  }
}

const handleIfReadConfig = async (args, res) => {
  if (args.update) {
    return
  }

  const state = await readState()
  res.send(stateReadView(state))
}

const handleIfUpdateConfig = async (args, res, req) => {
  if (!args.update) return

  let state = await readState()
  let { config = {} } = state
  const {
    botChannel: botCh,
    deployChannel: depCh
  } = args
  const botChannel = botCh ? getSlackChannel(botCh) : config.botChannel
  const deployChannel = depCh ? getSlackChannel(depCh) : config.deployChannel

  config = {
    ...config,
    deployChannel,
    botChannel
  }
  state = {
    ...state,
    config
  }
  const configValue = JSON.stringify(state, null, 2)
  const { trigger_id } = req.body

  await openDialog(trigger_id, stateDialogView(configValue))
  res.send()
}

module.exports = {
  statePost
}
