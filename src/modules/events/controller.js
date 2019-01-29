const { pathOr } = require('ramda')

const { releaseManagerUpdatedView } = require('./views')
const { readConfig, updateConfig } = require('../../bot-config')
const { sendMessageToChannel } = require('../slack/integration')
const { getSlackUserTags, getSlackUser } = require('../../utils')
const log = require('../../utils/log')
const {
  isDeploymentEvent,
  isSuccessfullDeployment,
  getBuildInfo } = require('./utils')

const { handleIfBranchBuildEvent } = require('./build-events')

const eventsPost = async (req, res) => {
  const event = pathOr({}, ['body', 'event'], req)

  handleIfChannelTopicEvent(event)
  handleIfBuildEvent(event)
  res.send(req.body.challenge)
}

const handleIfBuildEvent = async ({ type, subtype, channel, attachments }) => {
  if (type !== 'message' || subtype !== 'bot_message') {
    return
  }

  const { deployChannel } = await readConfig()
  if (channel !== deployChannel.id) {
    log.log(`Build Event > channel miss-matched, current: ${channel}, interest: ${deployChannel}`)
    return
  }

  const message = attachments.reduce((acc, { text }) => acc + text + '\n', '')
  if (!isDeploymentEvent(message)) {
    log.log(`Build Event > not a build event, message: ${message}`)
    return
  }

  const build = getBuildInfo(message)
  const { branch, environment } = build
  if (!isSuccessfullDeployment(message)) {
    log.log(`Build Event > failed build event, branch: ${branch}, environment: ${environment}`)
    return
  }

  handleIfBranchBuildEvent(build)
}

const handleIfChannelTopicEvent = async ({ type, subtype, text, topic, channel }) => {
  if (
    type !== 'message' ||
    !['group_topic', 'channel_topic'].includes(subtype)
  ) {
    return
  }

  const { botChannel } = await readConfig()
  if (channel !== botChannel.id) {
    return
  }

  const [author] = getSlackUserTags(text)
  const user = getSlackUser(author)
  const releaseManagers = getSlackUserTags(topic).map(u => getSlackUser(u))
  await Promise.all([
    updateConfig({ releaseManagers }),
    sendMessageToChannel(botChannel, releaseManagerUpdatedView(user, releaseManagers))
  ])
}

module.exports = {
  eventsPost
}
