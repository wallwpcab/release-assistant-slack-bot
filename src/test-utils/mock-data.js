const { splitValues } = require('../utils')
const { RequestStatus, DeploymentStatus } = require('../modules/request/mappings')

const mockUser = {
  id: 'user'
}

const mockChannel = {
  id: 'channel-1'
}

const mockMessage = {
  text: 'Mock Message'
}

const mockFile = {
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
  permalink: 'http://messages.slack.com/link-1',
  file: mockFile,
  status: RequestStatus.initial,
  deploymentId: 'dep-1'
}

const mockApprovedRequest = {
  ...mockInitialRequest,
  id: 'req-2',
  status: RequestStatus.approved,
  approver: mockUser
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
  infoLink: 'https://google.com',
  triggerLink: 'https://google.com',
  environment: DeploymentStatus.staging
}

const mockProductionBuild = {
  ...mockInitialBuild,
  id: '105',
  commitId: mockGitCommit.gitCommitAbbrev,
  infoLink: 'https://google.com',
  environment: DeploymentStatus.production
}

const mockInitialDeployment = {
  id: 'dep-1',
  status: DeploymentStatus.initial,
  baseCommit: mockGitCommit.gitCommitAbbrev,
  build: mockInitialBuild,
  requests: [mockInitialRequest]
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

const mockReportFormData = {
  section: 'landing-page',
  status: 'ok',
  description: ''
}

const mockConfirmedReport = {
  id: 'landing-page',
  ok: true,
  date: '2019-01-27T18:13:15.249Z',
  user: mockUser,
  description: ''
}

const mockIncorrectReport = {
  id: 'checkout',
  ok: false,
  date: '2019-02-27T19:12:15.249Z',
  user: mockUser,
  description: 'not ok'
}

const mockDailyReport = {
  [mockConfirmedReport.id]: mockConfirmedReport,
  [mockIncorrectReport]: mockIncorrectReport
}

const mockState = {
  config: {
    releaseChannel: {
      id: 'GEL8D0QRG',
      name: 'release-bot-test'
    },
    deployChannel: {
      id: 'CEML3BEK0',
      name: 'release-bot'
    },
    releaseManagers: [
      {
        id: 'UC29BCUN6'
      }
    ],
    reportSections: [
      {
        id: 'landing-page',
        label: 'Landing Page'
      },
      {
        id: 'checkout',
        label: 'Checkout'
      }
    ],
    stagingInfoUrl: 'http://staging.git.com/info',
    productionInfoUrl: 'http://production.git.com/info'
  },
  dailyReport: mockDailyReport,
  requests: {},
  deployments: {
    staging: {}
  }
}

module.exports = {
  mockState,
  mockRequestFormData,
  mockInitialRequest,
  mockApprovedRequest,
  mockUser,
  mockMessage,
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
  mockReportFormData,
  mockConfirmedReport,
  mockIncorrectReport,
  mockProductionDeployment
}
