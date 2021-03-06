const axios = require('axios')
const qs = require('querystring')
const {
  path,
  values,
  head,
  pipe
} = require('ramda')

const {
  httpClient
} = require('./http')
const {
  getFileContent
} = require('../../transformer')
const log = require('../../utils/log')

const getPermalink = async (channel, messageTs) => {
  const payload = {
    channel,
    message_ts: messageTs
  }
  const {
    data
  } = await httpClient().post('/chat.getPermalink', qs.stringify(payload))
  return data.permalink
}

const getChannel = async (users) => {
  const {
    data
  } = await httpClient().post('/conversations.open', {
    users: users.join(',')
  })
  return path(['channel', 'id'], data)
}

const sendMessage = async ({
  user: pUser = null,
  users: pUsers = null,
  channel: pChannel = null,
  message,
  thread = null
}) => {
  try {
    const users = pUser ? [pUser] : pUsers || []
    const channel = pChannel || await getChannel(users)
    const payload = {
      ...message,
      channel
    }
    if (thread) {
      payload.thread_ts = thread
    }

    await httpClient().post('/chat.postMessage', payload)
  } catch (err) {
    log.error('error in sendMessage()', err)
  }
}

const sendEphemeralMessage = async (user, message) => {
  try {
    const payload = {
      ...message,
      channel: await getChannel([user.id]),
      user: user.id
    }
    await httpClient().post('/chat.postEphemeral', payload)
  } catch (err) {
    log.error('error in sendMessage()', err)
  }
}

const sendMessageToUser = (user, message, thread = null) => sendMessage({
  user: user.id,
  message,
  thread
})
const sendMessageToUsers = (users, message, thread = null) => sendMessage({
  users: users.map(u => u.id),
  message,
  thread
})
const sendMessageToChannel = (channel, message, thread = null) => sendMessage({
  channel: channel.id,
  message,
  thread
})
const sendMessageOverUrl = async (url, message) => axios.post(url, message)

const openDialog = async (triggerId, dialog) => {
  try {
    await httpClient().post('/dialog.open', {
      trigger_id: triggerId,
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
  if (title) {
    file.title = title
  }
  if (comment) {
    file.initial_comment = comment
  }

  try {
    const {
      data
    } = await httpClient().post(
      '/files.upload',
      qs.stringify(file)
    )
    return data
  } catch (err) {
    log.error('error in uploadFile()', err)
    throw err
  }
}

const uploadRequestData = async (request, channel, comment) => {
  try {
    const {
      file
    } = await uploadFile(
      `${request.id}.txt`,
      getFileContent(request),
      channel,
      'Release Request',
      comment,
      'text',
    )

    // get value of: file.shares.private['CHANNEL_ID'][0].ts
    const getThread = pipe(path(['shares', 'private']), values, head, head, path(['ts']))

    return {
      id: file.id,
      permalink: file.permalink,
      thread_ts: getThread(file)
    }
  } catch (err) {
    log.error('error in uploadRequestData()', err)
    throw err
  }
}

module.exports = {
  sendEphemeralMessage,
  sendMessageToUser,
  sendMessageToUsers,
  sendMessageToChannel,
  sendMessageOverUrl,
  openDialog,
  uploadFile,
  uploadRequestData,
  getPermalink
}
