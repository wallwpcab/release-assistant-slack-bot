const axios = require('axios');
const config = require('config');
const qs = require('querystring');
const { pathOr } = require('ramda');

const { readConfig } = require('../../bot-config');
const { extractSlackChannelId, extractSlackUserId } = require('../../utils');
const log = require('../../utils/log');

const slackConfig = config.get('slack');

const authedAxios = axios.create({
  baseURL: slackConfig.apiUrl
})
authedAxios.defaults.headers.common['Authorization'] = 'Bearer ' + slackConfig.bot.token;

const postMessage = async (url, message) => {
  await axios.post(url, message);
}

const sendMessage = async (userId, message, ephemeral) => {
  try {
    const { data } = await authedAxios.post('/conversations.open', {
      users: userId
    });
    const channel = pathOr('', ['channel', 'id'], data)
    const postUrl = ephemeral ? '/chat.postEphemeral' : '/chat.postMessage';

    await authedAxios.post(postUrl, {
      ...message,
      channel,
      user: ephemeral ? userId : undefined
    });
  } catch (err) {
    log.error('error in sendMessage()', err);
  }
}

const sendMessageToUsers = async (users, message) => {
  try {
    const { data } = await authedAxios.post('/conversations.open', {
      users: users.map(u => extractSlackUserId(u)).join(',')
    });
    const channel = pathOr('', ['channel', 'id'], data)

    await authedAxios.post('/chat.postMessage', {
      ...message,
      channel
    });
  } catch (err) {
    log.error('error in sendMessageToUsers()', err);
  }
}

const postMessageToBotChannel = async (message) => {
  const { botChannelWebhook = '' } = await readConfig();
  if (!botChannelWebhook) {
    log.error('error in postMessageToBotChannel()', 'botChannelWebhook is not configured.');
  }
  try {
    await postMessage(botChannelWebhook, message);
  } catch (err) {
    log.error('error in postMessageToBotChannel()', err);
  }
}

const openDialog = async (trigger_id, dialog) => {
  try {
    await authedAxios.post('/dialog.open', {
      trigger_id,
      dialog: JSON.stringify(dialog)
    });
  } catch (err) {
    log.error('error in openDialog()', err);
  }
}

const uploadFile = async (filename, title, content, filetype = 'text', channels = []) => {
  try {
    const { data } = await authedAxios.post(
      '/files.upload',
      qs.stringify({
        filename,
        title,
        content,
        filetype,
        channels
      })
    );
    return data;
  } catch (err) {
    log.error('error in uploadFile()', err);
  }
}

const uploadRequestData = async (requestData) => {
  const { botChannel } = await readConfig();
  const { id } = requestData;
  try {
    const { file } = await uploadFile(`${id}.json`, 'Release Request', JSON.stringify(requestData, null, 4), 'json', [extractSlackChannelId(botChannel)]);
    return file
  } catch (err) {
    log.error('error in uploadRequestData()', err);
  }
}

const addCommentOnFile = async (file, comment) => {
  try {
    await authedAxios.post(
      '/files.comments.add',
      {
        file,
        comment
      }
    );
  } catch (err) {
    log.error('error in commentOnFile()', err);
  }
}

module.exports = {
  openDialog,
  sendMessage,
  sendMessageToUsers,
  postMessage,
  postMessageToBotChannel,
  uploadFile,
  uploadRequestData,
  addCommentOnFile
}
