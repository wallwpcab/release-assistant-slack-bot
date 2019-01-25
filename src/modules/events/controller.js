const { pathOr } = require('ramda')

const { releaseManagerUpdatedView } = require('./views')
const { readConfig, updateConfig } = require('../../bot-config')
const { postMessageToBotChannel } = require('../slack/integration')
const { extractSlackChannelId, extractSlackUsers } = require('../../utils')

const eventsPost = async (req, res) => {
  const event = pathOr({}, ['body', 'event'], req)

  handleIfChannelTopicChanged(event)
  handleIfDeployMessage(event)
  res.send(req.body.challenge)
}

const handleIfDeployMessage = async ({ type, subtype, channel, bot_id, attachments }) => {
  if (
    type !== 'message' ||
    subtype !== 'bot_message'
  ) {
    return
  }

  const { deployChannel } = await readConfig()
  if (channel !== extractSlackChannelId(deployChannel)) {
    return
  }

  const message = attachments.reduce((acc, { text }) =>  acc + text + '\n', '')
  console.log(message)
}

const handleIfChannelTopicChanged = async ({ type, subtype, text, topic, channel }) => {
  if (
    type !== 'message' ||
    !['group_topic', 'channel_topic'].includes(subtype)
  ) {
    return
  }

  const { botChannel } = await readConfig()
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
