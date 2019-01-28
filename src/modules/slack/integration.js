const axios = require('axios')
const qs = require('querystring')
const { path, pathOr, values, head, pipe } = require('ramda')

const { httpClient } = require('./http')
const { readConfig } = require('../../bot-config')
const { getSlackUserId } = require('../../utils')
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

const uploadFile = async (filename, content, channels, title = null, comment = null, filetype = 'auto') => {
  const file = {
    filename,
    content,
    channels,
    filetype
  }
  title && (file.title = title)
  title && (file.initial_comment = comment)

  try {
    const { data } = await httpClient().post(
      '/files.upload',
      qs.stringify(file)
    )
    return data
  } catch (err) {
    log.error('error in uploadFile()', err)
  }
}

const uploadRequestData = async (request, channel, comment) => {
  try {
    const { ok, file, error } = await uploadFile(
      `${request.id}.txt`,
      getFileContent(request),
      channel,
      'Release Request',
      comment,
      'text',
    )

    if (!ok) {
      throw error
    }

    // get value of: file.shares.private['CHANNEL_ID'][0].ts
    // const [thread_ts] = jsonPath.query(file, `$.shares.private.*[0].ts`)

    const getThread = pipe(path(['shares', 'private']), values, head, head, path(['ts']))

    return {
      id: file.id,
      permalink: file.permalink,
      thread_ts: getThread(file)
    }
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
