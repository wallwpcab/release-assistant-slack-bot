const { pathOr } = require('ramda')

const { releaseManagerUpdatedView, branchBuildManagerView } = require('./views')
const { readConfig, updateConfig } = require('../../bot-config')
const { postMessageToBotChannel, sendMessageToUsers } = require('../slack/integration')
const { getSlackChannelId, getSlackUsers } = require('../../utils')
const log = require('../../utils/log')
const {
  isDeploymentEvent,
  isSuccessfullDeployment,
  getBuildInfo,
  updateDeployment
} = require('./utils')

const eventsPost = async (req, res) => {
  const event = pathOr({}, ['body', 'event'], req)

  handleIfChannelTopicEvent(event)
  handleIfDeploymentEvent(event)
  res.send(req.body.challenge)
}

const handleIfDeploymentEvent = async ({ type, subtype, channel, bot_id, attachments }) => {
  if (
    type !== 'message' ||
    subtype !== 'bot_message'
  ) {
    return
  }

  const { deployChannel } = await readConfig()
  if (channel !== getSlackChannelId(deployChannel)) {
    log.log(`Deployment Event > channel miss-matched, current: ${channel}, interest: ${deployChannel}`)
    return
  }

  const message = attachments.reduce((acc, { text }) => acc + text + '\n', '')
  if (!isDeploymentEvent(message)) {
    log.log(`Deployment Event > not a deployment event, message: ${message}`)
    return
  }

  const build = getBuildInfo(message)
  const { branch, environment } = build
  if (!isSuccessfullDeployment(message)) {
    log.log(`Deployment Event > failed deployment event, branch: ${branch}, environment: ${environment}`)
    return
  }

  const { deployments, releaseManagers } = await readConfig()
  const deployment = Object.values(deployments)
    .find(d => d.branch === branch)

  if (!deployment) {
    log.log(`Deployment Event > branch:${branch} is not found in deployments: ${deployments}`)
    return
  }

  await Promise.all([
    updateDeployment(deployment, build),
    sendMessageToUsers(releaseManagers, branchBuildManagerView(build))
  ])
}

const handleIfChannelTopicEvent = async ({ type, subtype, text, topic, channel }) => {
  if (
    type !== 'message' ||
    !['group_topic', 'channel_topic'].includes(subtype)
  ) {
    return
  }

  const { botChannel } = await readConfig()
  if (channel !== getSlackChannelId(botChannel)) {
    return
  }

  const [author] = getSlackUsers(text)
  const releaseManagers = getSlackUsers(topic)
  await Promise.all([
    updateConfig({ releaseManagers }),
    postMessageToBotChannel(releaseManagerUpdatedView(author, releaseManagers))
  ])
}

module.exports = {
  eventsPost
}
