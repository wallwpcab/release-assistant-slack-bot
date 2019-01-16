const Nock = require('nock')
const config = require('config')

const { mockFile } = require('./mock-data')

const { apiUrl } = config.get('slack')

const nock = Nock(apiUrl)
  .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
  .log(console.log)

const mockFilesUploadApi = (payloadCallback) => {
  const payload = {
    filename: /^\S+/,
    title: /^\S+/,
    content: /^\S+/,
    filetype: /^\S+/,
    channels: /^\S+/
  }

  return nock
    .post('/files.upload', payloadCallback ? payloadCallback : payload)
    .reply(200, {
      file: mockFile
    })
}

const mockDialogOpenApi = () => {
  const payload = {
    trigger_id: /^\S+/,
    dialog: /^\S+/
  }

  return nock
    .post('/dialog.open', payload)
    .reply(200)
}

const mockConversationsOpensApi = () => {
  const payload = {
    users: /^\S+/
  }

  return nock
    .post('/conversations.open', payload)
    .reply(200, {
      channel: {
        id: 'channel-1'
      }
    })
}

const mockChatPostMessageApi = (payloadCallback) => {
  const payload = {
    text: /^\S+/,
    channel: /^\S+/
  }

  mockConversationsOpensApi()
  return nock
    .post('/chat.postMessage', payloadCallback ? payloadCallback : payload)
    .reply(200)
}

const mockChatPostEphemeralApi = (payloadCallback) => {
  const payload = {
    text: /^\S+/,
    channel: /^\S+/,
    user: /^\S+/
  }

  mockConversationsOpensApi()
  return nock
    .post('/chat.postEphemeral', payloadCallback ? payloadCallback : payload)
    .reply(200)
}

const mockPostMessageApi = (url, payloadCallback) => {
  const nock = Nock(url)
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .log(console.log)

  const payload = {
    text: /^\S+/
  }

  return nock
    .post('', payloadCallback ? payloadCallback : payload)
    .reply(200)
}

const mockFilesCommentsAddApi = () => {
  const payload = {
    file: /^\S+/,
    comment: /^\S+/
  }

  return nock
    .post('/files.comments.add', payload)
    .reply(200)
}

module.exports = {
  mockFilesUploadApi,
  mockDialogOpenApi,
  mockChatPostMessageApi,
  mockChatPostEphemeralApi,
  mockPostMessageApi,
  mockFilesCommentsAddApi
}
