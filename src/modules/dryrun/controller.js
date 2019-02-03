const minimist = require('minimist')

const { sendMessageToChannel } = require('../slack/integration')
const { readState } = require('../../bot-state')
const { splitValues } = require('../../utils')
const log = require('../../utils/log')
const {
  branchBuildView,
  stagingBuildView,
  productionBuildView
} = require('./views')

const handleIfTestBranchBuild = async ({ branchBuild, b: branch }, res) => {
  if (!branchBuild) return

  const { config } = await readState()
  res.send()
  sendMessageToChannel(config.botChannel, branchBuildView(branch))
}

const handleIfTestStagingBuild = async ({ stagingBuild, b: branch }, res) => {
  if (!stagingBuild) return

  const { config } = await readState()
  res.send()
  sendMessageToChannel(config.botChannel, stagingBuildView(branch))
}

const handleIfTestProductionBuild = async ({ productionBuild, b: branch }, res) => {
  if (!productionBuild) return

  const { config } = await readState()
  res.send()
  sendMessageToChannel(config.botChannel, productionBuildView(branch))
}

const dryrunPost = async (req, res) => {
  const { text } = req.body
  try {
    const args = minimist(splitValues(text))
    handleIfTestBranchBuild(args, res)
    handleIfTestStagingBuild(args, res)
    handleIfTestProductionBuild(args, res)
  } catch (err) {
    log.error('handleIfUpdateConfig() > openDialog failed', err)
    res.sendStatus(500)
  }
}

module.exports = {
  dryrunPost
}
