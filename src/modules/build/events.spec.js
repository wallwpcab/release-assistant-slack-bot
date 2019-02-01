require('../../test-utils/mock-implementations')
const { waitForInternalPromises } = require('../../test-utils')
const { readState, updateState } = require('../../bot-state')
const { mockMessageApi } = require('../../test-utils/mock-api')
const { DeploymentStatus } = require('../request/mappings')
const {
  mockState,
  mockInitialRequest,
  mockApprovedRequest,
  mockInitialDeployment,
  mockBranchBuild,
  mockStagingBuild,
  mockBranchDeployment,
  mockProductionBuild,
  mockStagingDeployment,
  mockProductionDeployment
} = require('../../test-utils/mock-data')
const {
  branchBuildManagerView,
  stagingBuildManagerView,
  stagingBuildChannelView,
  productionBuildChannelView
} = require('./event-views')
const {
  handleIfBranchBuildEvent,
  handleIfStagingBuildEvent,
  handleIfProductionBuildEvent
} = require('./events')

describe('Events controller', async () => {
  beforeEach(async () => {
    await updateState({
      ...mockState,
      requests: {
        [mockInitialRequest.id]: mockInitialRequest,
        [mockApprovedRequest.id]: mockApprovedRequest
      }
    }, true)
  })

  it('Can handle branch build event', async () => {
    /** mock api **/
    const chatApi = mockMessageApi(message => {
      expect(message).toMatchObject(branchBuildManagerView(mockBranchDeployment))
      return true
    })

    await updateState({
      deployments: {
        [mockInitialDeployment.id]: mockInitialDeployment
      }
    })
    await handleIfBranchBuildEvent(mockBranchBuild)
    await waitForInternalPromises()

    const { deployments } = await readState()
    const deployment = deployments[mockInitialDeployment.id]
    expect(deployment.status).toEqual(DeploymentStatus.branch)

    expect(chatApi.isDone()).toBe(true)
  })

  it('Can handle staging build event', async () => {
    const payloadCallback = message => {
      expect([
        stagingBuildManagerView(mockStagingDeployment).text,
        stagingBuildChannelView(mockStagingDeployment).text
      ]).toContain(message.text)
      return true
    }

    /** mock api **/
    const userMessageApi = mockMessageApi(payloadCallback)
    const channelMessageApi = mockMessageApi(payloadCallback)

    await updateState({
      deployments: {
        [mockBranchDeployment.id]: mockBranchDeployment
      }
    })
    await handleIfStagingBuildEvent(mockStagingBuild)
    await waitForInternalPromises()

    const { deployments } = await readState()
    const deployment = deployments[mockBranchDeployment.id]

    expect(userMessageApi.isDone()).toBe(true)
    expect(channelMessageApi.isDone()).toBe(true)
    expect(deployment.status).toEqual(DeploymentStatus.staging)
    expect(deployments.staging.build).toEqual(mockStagingBuild)
  })

  it('Can handle production build event', async () => {
    /** mock api **/
    const chatApi = mockMessageApi(message => {
      expect(message).toMatchObject(productionBuildChannelView(mockProductionDeployment))
      return true
    })

    await updateState({
      deployments: {
        [mockBranchDeployment.id]: mockBranchDeployment
      }
    })
    await handleIfProductionBuildEvent(mockProductionBuild)
    await waitForInternalPromises()

    const { deployments } = await readState()
    const deployment = deployments[mockBranchDeployment.id]

    expect(chatApi.isDone()).toBe(true)
    expect(deployment.status).toEqual(DeploymentStatus.production)
  })
})
