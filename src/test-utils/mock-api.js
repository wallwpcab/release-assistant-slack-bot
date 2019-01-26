const nock = require('nock');
const config = require('config');

const {
  mockFile, mockConfig, mockGitCommit, mockChannel,
} = require('./mock-data');

const mockServer = url => nock(url)
  .defaultReplyHeaders({ 'access-control-allow-origin': '*' });

const mockSlackServer = () => {
  const { apiUrl } = config.get('slack');
  return mockServer(apiUrl);
};

const mockFilesUploadApi = (payloadCallback) => {
  const payload = {
    filename: /^\S+/,
    title: /^\S+/,
    content: /^\S+/,
    filetype: /^\S+/,
    channels: /^\S+/,
  };

  return mockSlackServer()
    .post('/files.upload', payloadCallback || payload)
    .reply(200, {
      file: {
        id: mockFile.id,
        permalink: mockFile.link,
      },
    });
};

const mockDialogOpenApi = (payloadCallback) => {
  const payload = {
    trigger_id: /^\S+/,
    dialog: /^\S+/,
  };

  return mockSlackServer()
    .post('/dialog.open', payloadCallback || payload)
    .reply(200);
};

const mockConversationsOpensApi = () => {
  const payload = {
    users: /^\S+/,
  };

  return mockSlackServer()
    .post('/conversations.open', payload)
    .reply(200, {
      channel: mockChannel,
    });
};

const mockChatPostMessageApi = (payloadCallback) => {
  const payload = {
    text: /^\S+/,
    channel: /^\S+/,
  };

  mockConversationsOpensApi();
  return mockSlackServer()
    .post('/chat.postMessage', payloadCallback || payload)
    .reply(200);
};

const mockChatPostEphemeralApi = (payloadCallback) => {
  const payload = {
    text: /^\S+/,
    channel: /^\S+/,
    user: /^\S+/,
  };

  mockConversationsOpensApi();
  return mockSlackServer()
    .post('/chat.postEphemeral', payloadCallback || payload)
    .reply(200);
};

const mockPostMessageApi = (url, payloadCallback) => {
  const payload = {
    text: /^\S+/,
  };

  return mockServer(url)
    .post('', payloadCallback || payload)
    .reply(200);
};

const mockFilesCommentsAddApi = (payloadCallback) => {
  const payload = {
    file: /^\S+/,
    comment: /^\S+/,
  };

  return mockSlackServer()
    .post('/files.comments.add', payloadCallback || payload)
    .reply(200);
};

const mockGitStagingApi = () => mockServer(mockConfig.stagingInfoUrl).get('')
  .reply(200, {
    info: mockGitCommit,
  });

const mockGitProductionApi = () => mockServer(mockConfig.productionInfoUrl).get('')
  .reply(200, {
    info: mockGitCommit,
  });

module.exports = {
  mockServer,
  mockFilesUploadApi,
  mockDialogOpenApi,
  mockChatPostMessageApi,
  mockChatPostEphemeralApi,
  mockPostMessageApi,
  mockFilesCommentsAddApi,
  mockGitStagingApi,
  mockGitProductionApi,
};
