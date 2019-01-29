require('../../test-utils/mock-implementations')
const { waitForInternalPromises } = require('../../test-utils')
const { readConfig, updateConfig } = require('../../bot-config')
const { mockMessageApi } = require('../../test-utils/mock-api')
const { mockConfig, mockInitialDeployment, mockBranchDeployment, mockBranchBuild, mockStagingBuild, mockProductionBuild } = require('../../test-utils/mock-data')
const { branchBuildManagerView, stagingBuildManagerView, stagingBuildChannelView } = require('./views')
const { DeploymentStatus } = require('../request/mappings')
const { handleIfBranchBuildEvent, handleIfStagingBuildEvent, handleIfProductionBuildEvent } = require('./build-events')

describe('Events controller', async () => {

  beforeEach(async () => {
    await updateConfig(mockConfig, true)
  })

  it('Can handle branch build event', async () => {
    /** mock api **/
    const chatApi = mockMessageApi(message => {
      expect(message).toMatchObject(branchBuildManagerView(mockBranchDeployment.build))
      return true
    })

    await updateConfig({
      deployments: {
        [mockInitialDeployment.id]: mockInitialDeployment
      }
    })
    await handleIfBranchBuildEvent(mockBranchBuild)
    await waitForInternalPromises()

    const { deployments } = await readConfig()
    const deployment = deployments[mockInitialDeployment.id]
    expect(deployment.status).toEqual(DeploymentStatus.branch)

    expect(chatApi.isDone()).toBe(true)
  })

  it('Can handle staging build event', async () => {
    const payloadCallback = message => {
      expect([
        stagingBuildManagerView(mockStagingBuild).text,
        stagingBuildChannelView(mockProductionBuild).text
      ]).toContain(message.text)
      return true
    }

    /** mock api **/
    const userMessageApi = mockMessageApi(payloadCallback)
    const channelMessageApi = mockMessageApi(payloadCallback)

    await updateConfig({
      deployments: {
        [mockBranchDeployment.id]: mockBranchDeployment
      }
    })
    await handleIfStagingBuildEvent(mockStagingBuild)
    await waitForInternalPromises()

    const { deployments } = await readConfig()
    const deployment = deployments[mockBranchDeployment.id]

    expect(userMessageApi.isDone()).toBe(true)
    expect(channelMessageApi.isDone()).toBe(true)
    expect(deployment.status).toEqual(DeploymentStatus.staging)
    expect(deployments.staging.build).toEqual(mockStagingBuild)
  })

  it('Can handle production build event', async () => {
    /** mock api **/
    const chatApi = mockMessageApi(message => {
      expect(message).toMatchObject(stagingBuildManagerView(mockProductionBuild))
      return true
    })

    await updateConfig({
      deployments: {
        [mockBranchDeployment.id]: mockBranchDeployment
      }
    })
    await handleIfProductionBuildEvent(mockProductionBuild)
    await waitForInternalPromises()

    const { deployments } = await readConfig()
    const deployment = deployments[mockBranchDeployment.id]

    expect(chatApi.isDone()).toBe(true)
    expect(deployment.status).toEqual(DeploymentStatus.production)
  })
})
