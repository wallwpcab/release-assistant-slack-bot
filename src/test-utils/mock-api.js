// eslint-disable-next-line import/no-extraneous-dependencies
const nock = require('nock')
const config = require('config')

const {
  mockFile, mockState, mockGitCommit, mockChannel, mockInitialRequest
} = require('./mock-data')

const mockServer = url => nock(url)
  .defaultReplyHeaders({ 'access-control-allow-origin': '*' })

const mockSlackServer = () => {
  const { apiUrl } = config.get('slack')
  return mockServer(apiUrl)
}

const mockPermalinkApi = () => {
  const payload = {
    channel: /^\S+/,
    message_ts: /^\S+/
  }

  return mockSlackServer()
    .post('/chat.getPermalink', payload)
    .reply(200, {
      permalink: mockInitialRequest.permalink
    })
}

const mockConversationsApi = () => {
  const payload = {
    users: /^\S+/
  }

  return mockSlackServer()
    .post('/conversations.open', payload)
    .reply(200, {
      channel: mockChannel
    })
}

const mockMessageApi = (payloadCallback) => {
  const payload = {
    text: /^\S+/,
    channel: /^\S+/
  }

  mockConversationsApi()
  return mockSlackServer()
    .post('/chat.postMessage', payloadCallback || payload)
    .reply(200)
}

const mockEphemeralMessageApi = (payloadCallback) => {
  const payload = {
    text: /^\S+/,
    channel: /^\S+/,
    user: /^\S+/
  }

  mockConversationsApi()
  return mockSlackServer()
    .post('/chat.postEphemeral', payloadCallback || payload)
    .reply(200)
}

const mockPublicMessageApi = (url, payloadCallback) => {
  const payload = {
    text: /^\S+/
  }

  return mockServer(url)
    .post('', payloadCallback || payload)
    .reply(200)
}

const mockDialogOpenApi = (payloadCallback) => {
  const payload = {
    trigger_id: /^\S+/,
    dialog: /^\S+/
  }

  return mockSlackServer()
    .post('/dialog.open', payloadCallback || payload)
    .reply(200)
}

const mockFileApi = (payloadCallback) => {
  const payload = {
    filename: /^\S+/,
    content: /^\S+/,
    channels: /^\S+/,
    title: /^\S+/,
    initial_comment: /^\S/,
    filetype: /^\S+/
  }

  return mockSlackServer()
    .post('/files.upload', payloadCallback || payload)
    .reply(200, {
      ok: true,
      file: {
        id: mockFile.id,
        permalink: mockFile.permalink,
        shares: {
          private: {
            [mockChannel.id]: [{
              ts: '1548689875.001000'
            }]
          }
        }
      }
    })
}

const mockGitStagingApi = () => mockServer(mockState.config.stagingInfoUrl).get('')
  .reply(200, {
    info: mockGitCommit
  })

const mockGitProductionApi = () => mockServer(mockState.config.productionInfoUrl).get('')
  .reply(200, {
    info: mockGitCommit
  })

module.exports = {
  mockServer,
  mockFileApi,
  mockDialogOpenApi,
  mockMessageApi,
  mockEphemeralMessageApi,
  mockPublicMessageApi,
  mockGitStagingApi,
  mockGitProductionApi,
  mockPermalinkApi
}
