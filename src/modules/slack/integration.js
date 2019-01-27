const axios = require('axios')
const qs = require('querystring')
const { pathOr } = require('ramda')

const { httpClient } = require('./http')
const { readConfig } = require('../../bot-config')
const { getSlackChannelId, getSlackUserId } = require('../../utils')
const { getFileContent } = require('../../transformer')
const log = require('../../utils/log')

const postMessage = async (url, message) => {
  await axios.post(url, message)
}

const sendMessage = async (userId, message, ephemeral) => {
  try {
    const { data } = await httpClient().post('/conversations.open', {
      users: userId
    })
    const channel = pathOr('', ['channel', 'id'], data)
    const postUrl = ephemeral ? '/chat.postEphemeral' : '/chat.postMessage'

    await httpClient().post(postUrl, {
      ...message,
      channel,
      user: ephemeral ? userId : undefined
    })
  } catch (err) {
    log.error('error in sendMessage()', err)
  }
}

const sendMessageToUsers = async (users, message) => {
  try {
    const { data } = await httpClient().post('/conversations.open', {
      users: users.map(u => getSlackUserId(u)).join(',')
    })
    const channel = pathOr('', ['channel', 'id'], data)

    await httpClient().post('/chat.postMessage', {
      ...message,
      channel
    })
  } catch (err) {
    log.error('error in sendMessageToUsers()', err)
  }
}

const postMessageToBotChannel = async (message) => {
  const { botChannelWebhook = '' } = await readConfig()
  if (!botChannelWebhook) {
    log.error('error in postMessageToBotChannel()', 'botChannelWebhook is not configured.')
  }
  try {
    await postMessage(botChannelWebhook, message)
  } catch (err) {
    log.error('error in postMessageToBotChannel()', err)
  }
}

const openDialog = async (trigger_id, dialog) => {
  try {
    await httpClient().post('/dialog.open', {
      trigger_id,
      dialog: JSON.stringify(dialog)
    })
  } catch (err) {
    log.error('error in openDialog()', err)
  }
}

const uploadFile = async (filename, title, content, filetype = 'text', channels = '') => {
  try {
    const { data } = await httpClient().post(
      '/files.upload',
      qs.stringify({
        filename,
        title,
        content,
        filetype,
        channels
      })
    )
    return data
  } catch (err) {
    log.error('error in uploadFile()', err)
  }
}

const uploadRequestData = async (request) => {
  const { botChannel } = await readConfig()

  try {
    const { file } = await uploadFile(
      `${request.id}.txt`,
      'Release Request',
      getFileContent(request),
      'text',
      getSlackChannelId(botChannel)
    )
    return file
  } catch (err) {
    log.error('error in uploadRequestData()', err)
  }
}

const addCommentOnFile = async (file, comment) => {
  try {
    await httpClient().post(
      '/files.comments.add',
      {
        file,
        comment
      }
    )
  } catch (err) {
    log.error('error in commentOnFile()', err)
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
