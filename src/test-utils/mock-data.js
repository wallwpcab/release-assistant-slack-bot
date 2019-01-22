const { splitValues } = require('../utils')
const { RequestStatus } = require('../modules/request/mappings')

const mockUser = {
  id: 'user'
}

const mockInitiator = {
  id: 'initiator'
}

const mockRejector = {
  id: 'rejector'
}

const mockChannel = { 
  id: 'channel-1'
}

const mockFile = {
  id: 'file-1',
  link: 'http://files.com/file-1'
}

const mockGitCommit = {
  gitCommitAbbrev: 'b9c3b02',
  gitCommit: 'b9c3b0201c3ffd4218e6277d99be2c74dbb0f864'
}

const mockRequestFormData = {
  requestType: 'hotfix',
  commits: 'sha1, sha2',
  description: 'Hotfix Reqest',
  approval: null,
  subscribers: '<@user1>, #bot'
}

const mockRequest = {
  id: 'req-1',
  type: mockRequestFormData.requestType,
  commits: splitValues(mockRequestFormData.commits),
  subscribers: splitValues(mockRequestFormData.subscribers),
  description: mockRequestFormData.description,
  approval: mockRequestFormData.approval,
  user: mockUser,
  file: mockFile,
  status: RequestStatus.initial
}

const mockApprovedRequest = {
  ...mockRequest,
  id: 'req-2',
  status: RequestStatus.approved,
  initiator: mockInitiator,
  baseCommit: mockGitCommit.gitCommitAbbrev
}

const mockConfig = {
  botChannel: '<#GEL8D0QRG|release-bot-test>',
  botChannelWebhook: 'http://webhook.slack/bot-channel',
  stagingInfoUrl: 'http://staging.git.com/info',
  productionInfoUrl: 'http://production.git.com/info',
  releaseManagers:['<@UC29BCUN6>'],
  requests: {}
}

module.exports = {
  mockConfig,
  mockRequestFormData,
  mockRequest,
  mockInitiator,
  mockApprovedRequest,
  mockRejector,
  mockUser,
  mockFile,
  mockGitCommit,
  mockChannel
}
