const express = require('express');
const { pathOr } = require('ramda');

const { releaseManagerUpdatedView } = require('./views');
const { readConfig, updateConfig } = require('../../bot-config');
const { sendMessageToBotChannel } = require('../slack/integration');
const { extractSlackChannelId, extractSlackUsers } = require('../../utils');

const router = express.Router();

router.post('/slack/events', async (req, res) => {
  const event = pathOr({}, ['body', 'event'], req);

  handleIfChannelTopicChanged(event);
  res.send(req.body.challenge);
});

const handleIfChannelTopicChanged = async ({ type, subtype, text, topic, channel }) => {
  const { botChannel } = await readConfig();

  if (
    channel !== extractSlackChannelId(botChannel)
    || type !== 'message'
    || !['group_topic', 'channel_topic'].includes(subtype)
  ) {
    return;
  }

  const [author] = extractSlackUsers(text);
  const releaseManagers = extractSlackUsers(topic);
  await updateConfig({ releaseManagers })
  await sendMessageToBotChannel(releaseManagerUpdatedView(author, releaseManagers));
}

module.exports = router;
