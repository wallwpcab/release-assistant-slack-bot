const minimist = require('minimist')

const { sendMessageToChannel } = require('../slack/integration')
const { readConfig } = require('../../bot-config')
const { splitValues } = require('../../utils')
const log = require('../../utils/log')
const {
  branchBuildView,
  stagingBuildView,
  productionBuildView
} = require('./views')

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

const handleIfTestBranchBuild = async ({ branchBuild, branch }, res) => {
  if (!branchBuild) return

  const { botChannel } = await readConfig()
  res.send()
  sendMessageToChannel(botChannel, branchBuildView(branch))
}

const handleIfTestStagingBuild = async ({ stagingBuild, branch }, res) => {
  if (!stagingBuild) return

  const { botChannel } = await readConfig()
  res.send()
  sendMessageToChannel(botChannel, stagingBuildView(branch))
}

const handleIfTestProductionBuild = async ({ productionBuild, branch }, res) => {
  if (!productionBuild) return

  const { botChannel } = await readConfig()
  res.send()
  sendMessageToChannel(botChannel, productionBuildView(branch))
}

module.exports = {
  dryrunPost
}
