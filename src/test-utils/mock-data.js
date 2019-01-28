const { splitValues } = require('../utils')
const { RequestStatus, DeploymentStatus } = require('../modules/request/mappings')

const mockUser = {
  id: 'user'
}

const mockApprover = {
  id: 'approver'
}

const mockRejector = {
  id: 'rejector'
}

const mockChannel = {
  id: 'channel-1'
}

const mockMessage = {
  text: 'Mock Message'
}

const mockFile = {
  id: 'file-1',
  permalink: 'http://files.com/file-1',
  thread_ts: '1548689875.001000'
}

const mockGitCommit = {
  gitCommitAbbrev: 'b9c3b02',
  gitCommit: 'b9c3b0201c3ffd4218e6277d99be2c74dbb0f864'
}

const mockRequestFormData = {
  requestType: 'hotfix',
  commits: 'sha1, sha2',
  description: 'Hotfix Reqest',
  approval: null
}

const mockInitialRequest = {
  id: 'req-1',
  type: mockRequestFormData.requestType,
  commits: splitValues(mockRequestFormData.commits),
  description: mockRequestFormData.description,
  approval: mockRequestFormData.approval,
  date: '2019-01-27T18:13:15.249Z',
  user: mockUser,
  file: mockFile,
  status: RequestStatus.initial,
  deploymentId: 'dep-1'
}

const mockApprovedRequest = {
  ...mockInitialRequest,
  id: 'req-2',
  status: RequestStatus.approved,
  approver: mockApprover
}

const mockInitialBuild = {
  branch: 'release/2018-10-14/hotfix/dep-1'
}

const mockBranchBuild = {
  ...mockInitialBuild,
  commitId: mockGitCommit.gitCommitAbbrev,
  triggerLink: 'https://google.com',
  environment: DeploymentStatus.branch
}

const mockStagingBuild = {
  ...mockInitialBuild,
  id: '104',
  commitId: mockGitCommit.gitCommitAbbrev,
  triggerLink: 'https://google.com',
  environment: DeploymentStatus.staging
}

const mockProductionBuild = {
  ...mockInitialBuild,
  id: '105',
  commitId: mockGitCommit.gitCommitAbbrev,
  environment: DeploymentStatus.production
}

const mockInitialDeployment = {
  id: 'dep-1',
  status: DeploymentStatus.initial,
  baseCommit: mockGitCommit.gitCommitAbbrev,
  build: mockInitialBuild,
  requests: [mockInitialRequest.id]
}

const mockBranchDeployment = {
  ...mockInitialDeployment,
  id: 'dep-2',
  status: DeploymentStatus.branch,
  build: mockBranchBuild
}

const mockStagingDeployment = {
  ...mockInitialDeployment,
  id: 'dep-3',
  status: DeploymentStatus.staging,
  build: mockStagingBuild
}

const mockProductionDeployment = {
  ...mockInitialDeployment,
  id: 'dep-4',
  status: DeploymentStatus.production,
  build: mockProductionBuild
}

const mockConfig = {
  botChannel: { id: 'GEL8D0QRG', name: 'release-bot-test' },
  deployChannel: { id: 'GEL8D0QRG', name: 'release-bot-test' },
  stagingInfoUrl: 'http://staging.git.com/info',
  productionInfoUrl: 'http://production.git.com/info',
  releaseManagers: [{ id: 'UC29BCUN6' }],
  requests: {},
  deployments: {
    staging: {}
  }
}

module.exports = {
  mockConfig,
  mockRequestFormData,
  mockInitialRequest,
  mockApprover,
  mockApprovedRequest,
  mockRejector,
  mockMessage,
  mockUser,
  mockFile,
  mockGitCommit,
  mockChannel,
  mockInitialBuild,
  mockInitialDeployment,
  mockBranchBuild,
  mockBranchDeployment,
  mockStagingBuild,
  mockStagingDeployment,
  mockProductionBuild,
  mockProductionDeployment
}
