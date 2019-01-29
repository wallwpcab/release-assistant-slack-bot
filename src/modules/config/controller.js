const minimist = require('minimist')

const { openDialog, sendMessageToChannel } = require('../slack/integration')
const { readConfig } = require('../../bot-config')
const { splitValues } = require('../../utils')
const log = require('../../utils/log')
const {
  configReadView,
  configDialogView,
  branchBuildView,
  stagingBuildView,
  productionBuildView
} = require('./views')

const configPost = async (req, res) => {
  const { text } = req.body
  try {
    const args = minimist(splitValues(text))
    handleIfReadConfig(args, res)
    handleIfUpdateConfig(args, res, req)
    handleIfTestBranchBuild(args, res)
    handleIfTestStagingBuild(args, res)
    handleIfTestProductionBuild(args, res)
  } catch (err) {
    log.error('handleIfUpdateConfig() > openDialog failed', err)
    res.sendStatus(500)
  }
}

const handleIfReadConfig = async (args, res) => {
  if (
    args.update ||
    args.testBranchBuild ||
    args.testStagingBuild ||
    args.testProductionBuild
  ) {
    return
  }

  const config = await readConfig()
  res.send(configReadView(config))
}

const handleIfTestBranchBuild = async ({ testBranchBuild, branch }, res) => {
  if (!testBranchBuild) return

  const { botChannel } = await readConfig()
  res.send()
  sendMessageToChannel(botChannel, branchBuildView(branch))
}

const handleIfTestStagingBuild = async ({ testStagingBuild, branch }, res) => {
  if (!testStagingBuild) return

  const { botChannel } = await readConfig()
  res.send()
  sendMessageToChannel(botChannel, stagingBuildView(branch))
}

const handleIfTestProductionBuild = async ({ testProductionBuild, branch }, res) => {
  if (!testProductionBuild) return

  const { botChannel } = await readConfig()
  res.send()
  sendMessageToChannel(botChannel, productionBuildView(branch))
}

const handleIfUpdateConfig = async (args, res, req) => {
  if (!args.update) return

  const config = await readConfig()
  // TODO: ??
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
