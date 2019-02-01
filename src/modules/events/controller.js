const { pathOr } = require('ramda')

const { releaseManagerUpdatedView } = require('../build/event-views')
const { readState, updateState } = require('../../bot-state')
const { sendMessageToChannel } = require('../slack/integration')
const { getSlackUserTags, getSlackUser } = require('../../utils')
const log = require('../../utils/log')
const {
  isDeploymentEvent,
  isSuccessfullDeployment,
  getBuildInfo
} = require('../build/utils')

const {
  handleIfBranchBuildEvent,
  handleIfStagingBuildEvent,
  handleIfProductionBuildEvent
} = require('../build/events')

const eventsPost = async (req, res) => {
  const event = pathOr({}, ['body', 'event'], req)

  handleIfChannelTopicEvent(event)
  handleIfBuildEvent(event)
  res.send(req.body.challenge)
}

const handleIfBuildEvent = async ({ type, subtype, channel, attachments }) => {
  if (type !== 'message' || subtype !== 'bot_message') return
  if (!attachments) return

  const { config } = await readState()
  const { deployChannel } = config
  if (channel !== deployChannel.id) {
    log.log(`Build Event > channel miss-matched, current: ${channel}, interest: ${deployChannel}`)
    return
  }

  const message = attachments.reduce((acc, { text }) => acc + text + '\n', '')
  if (!isDeploymentEvent(message)) {
    log.info(`Build Event > not a build event, message: ${message}`)
    return
  }

  const build = getBuildInfo(message)
  const { branch, environment } = build
  if (!isSuccessfullDeployment(message)) {
    log.info(`Build Event > failed build event, branch: ${branch}, environment: ${environment}`)
    return
  }

  handleIfBranchBuildEvent(build)
  handleIfStagingBuildEvent(build)
  handleIfProductionBuildEvent(build)
}

const handleIfChannelTopicEvent = async ({ type, subtype, text, topic, channel }) => {
  if (
    type !== 'message' ||
    !['group_topic', 'channel_topic'].includes(subtype)
  ) {
    return
  }

  let { config } = await readState()
  const { botChannel } = config
  if (channel !== botChannel.id) {
    log.info(`Channel topic event > Channel: ${channel} missmatched with botChannel: ${botChannel}`)
    return
  }

  const [author] = getSlackUserTags(text)
  const user = getSlackUser(author)
  const releaseManagers = getSlackUserTags(topic).map(u => getSlackUser(u))
  config = {
    releaseManagers
  }
  await Promise.all([
    updateState({ config }),
    sendMessageToChannel(botChannel, releaseManagerUpdatedView(user, releaseManagers))
  ])
}

module.exports = {
  eventsPost
}
