require('../../test-utils/mock-implementations')
const {
  mockState
} = require('../../test-utils/mock-data')
const {
  updateState
} = require('../../bot-state')
const {
  branchBuildView,
  stagingBuildView,
  productionBuildView
} = require('../dryrun/views')
const {
  isDeploymentEvent,
  getBuildInfo
} = require('./utils')

const buildMessage = ({
  attachments
}) => attachments
  .reduce((acc, {
    text
  }) => `${acc + text}\n`, '')

describe('Events Utils', async () => {
  beforeEach(async () => {
    await updateState(mockState, true)
  })

  it('Can detect if a branch deployment occured from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = buildMessage(branchBuildView(branch))

    expect(isDeploymentEvent(message)).toBe(true)
  })

  it('Can extract branch from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = buildMessage(branchBuildView(branch))

    expect(isDeploymentEvent(message)).toBe(true)
    expect(getBuildInfo(message)).toMatchObject({
      branch,
      commitId: 'c03012d',
      environment: 'branch',
      triggerLink: 'https://google.com'
    })
  })

  it('Can detect if a staging deployment occured from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = buildMessage(stagingBuildView(branch))

    expect(isDeploymentEvent(message)).toBe(true)
    expect(getBuildInfo(message)).toMatchObject({
      id: '232',
      branch,
      commitId: 'c03012d',
      environment: 'staging',
      triggerLink: 'https://google.com'
    })
  })

  it('Can detect if a production deployment occured from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = buildMessage(productionBuildView(branch))

    expect(isDeploymentEvent(message)).toBe(true)
    expect(getBuildInfo(message)).toMatchObject({
      id: '106',
      branch,
      commitId: 'c03012d',
      environment: 'production'
    })
  })
})
