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

// [*LIVE*] Deployed *master* (auth: glass/Glass-Passw0rd) version `786251e`.
// Build #689 status is: *SUCCESS*. test results / artifacts / commits / changelog

// ```786251e - (HEAD, origin/master) Merge pull request #2378 in GLASS/glass from CHK-7316 to master (2018-12-12T15:31:05+01:00) <Gomes, Yuri>```

// Click *here* to promote `786251e` to `staging` environment. deployment plan
