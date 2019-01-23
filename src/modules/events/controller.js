const { pathOr } = require('ramda')

const { releaseManagerUpdatedView } = require('./views')
const { readConfig, updateConfig } = require('../../bot-config')
const { postMessageToBotChannel } = require('../slack/integration')
const { extractSlackChannelId, extractSlackUsers } = require('../../utils')

const eventsPost = async (req, res) => {
  const event = pathOr({}, ['body', 'event'], req)

  handleIfChannelTopicChanged(event)
  res.send(req.body.challenge)
}

const handleIfChannelTopicChanged = async ({ type, subtype, text, topic, channel }) => {
  const { botChannel } = await readConfig()
  if (
    type !== 'message' ||
    !['group_topic', 'channel_topic'].includes(subtype)
  ) {
    return
  }

  if (channel !== extractSlackChannelId(botChannel)) {
    return
  }

  const [author] = extractSlackUsers(text)
  const releaseManagers = extractSlackUsers(topic)
  await Promise.all([
    updateConfig({ releaseManagers }),
    postMessageToBotChannel(releaseManagerUpdatedView(author, releaseManagers))
  ])
}

module.exports = {
  eventsPost
}
