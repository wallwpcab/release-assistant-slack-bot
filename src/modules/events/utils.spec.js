const { mockDeployment } = require('../../test-utils/mock-data')
const { readConfig } = require('../../bot-config')
const { DeploymentStatus } = require('../request/mappings')
const { branchBuildView, stagingBuildView, productionBuildView } = require('../config/views')
const {
  isDeploymentEvent,
  getDeploymentInfo,
  updateDeployment
} = require('./utils')

const buildMessage = ({ attachments }) => attachments
  .reduce((acc, { text }) => acc + text + '\n', '')

describe('Events Utils', () => {
  it('Can detect if a branch deployment occured from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = buildMessage(branchBuildView(branch))

    expect(isDeploymentEvent(message)).toBe(true)
  })

  it('Can extract branch from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = buildMessage(branchBuildView(branch))

    expect(isDeploymentEvent(message)).toBe(true)
    expect(getDeploymentInfo(message)).toMatchObject({
      branch,
      commitId: 'c03012d',
      environment: 'branch',
      promotionLink: 'https://google.com'
    })
  })

  it('Can detect if a staging deployment occured from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = buildMessage(stagingBuildView(branch))

    expect(isDeploymentEvent(message)).toBe(true)
    expect(getDeploymentInfo(message)).toMatchObject({
      branch,
      commitId: 'c03012d',
      buildNo: '232',
      environment: 'staging',
      promotionLink: 'https://google.com'
    })
  })

  it('Can detect if a production deployment occured from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = buildMessage(productionBuildView(branch))

    expect(isDeploymentEvent(message)).toBe(true)
    expect(getDeploymentInfo(message)).toMatchObject({
      branch,
      commitId: 'c03012d',
      buildNo: '106',
      environment: 'production'
    })
  })

  it('Can update deployment', async () => {
    await updateDeployment(mockDeployment, {
      commitId: 'sha-1',
      buildNo: '203',
      promotionLink: 'https://google.com',
      environment: DeploymentStatus.branch
    })
    const { deployments } = await readConfig()
    const deployment = deployments[mockDeployment.id]
    expect(deployment).toMatchObject({
      commitId: 'sha-1',
      buildNo: '203',
      promotionLink: 'https://google.com',
      status: DeploymentStatus.branch
    })
  })
})
