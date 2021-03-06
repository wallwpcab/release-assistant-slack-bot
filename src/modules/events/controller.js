const {
  pathOr
} = require('ramda')

const {
  releaseManagerUpdatedManagerView,
  releaseManagerUpdatedChannelView
} = require('../build/event-views')
const {
  readState,
  updateState
} = require('../../bot-state')
const {
  sendMessageToUsers,
  sendMessageToChannel
} = require('../slack/integration')
const {
  getSlackUserTags,
  getSlackUser
} = require('../../utils')
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

const handleIfBuildEvent = async ({
  type,
  subtype,
  channel,
  attachments
}) => {
  if (type !== 'message' || subtype !== 'bot_message' || !attachments) return

  const {
    config
  } = await readState()
  const {
    deployChannel
  } = config
  if (channel !== deployChannel.id) {
    log.info(`Build Event > channel miss-matched, current: ${channel}, interest: ${deployChannel}`)
    return
  }

  const message = attachments.reduce((acc, {
    text
  }) => `${acc + text}\n`, '')
  if (!isDeploymentEvent(message)) {
    log.info(`Build Event > not a build event, message: ${message}`)
    return
  }

  const build = getBuildInfo(message)
  const {
    branch,
    environment
  } = build
  if (!isSuccessfullDeployment(message)) {
    log.info(`Build Event > failed build event, branch: ${branch}, environment: ${environment}`)
    return
  }

  handleIfBranchBuildEvent(build)
  handleIfStagingBuildEvent(build)
  handleIfProductionBuildEvent(build)
}

const handleIfChannelTopicEvent = async ({
  type,
  subtype,
  text,
  topic,
  channel
}) => {
  if (
    type !== 'message'
    || !['group_topic', 'channel_topic'].includes(subtype)
  ) {
    return
  }

  let {
    config
  } = await readState()
  const {
    releaseChannel
  } = config
  if (channel !== releaseChannel.id) {
    log.info(`Channel topic event > Channel: ${channel} missmatched with releaseChannel: ${releaseChannel}`)
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
    sendMessageToUsers(releaseManagers, releaseManagerUpdatedManagerView(releaseManagers)),
    sendMessageToChannel(releaseChannel, releaseManagerUpdatedChannelView(user, releaseManagers))
  ])
}

const eventsPost = async (req, res) => {
  const event = pathOr({}, ['body', 'event'], req)

  handleIfChannelTopicEvent(event)
  handleIfBuildEvent(event)
  res.send(req.body.challenge)
}

module.exports = {
  eventsPost
}
