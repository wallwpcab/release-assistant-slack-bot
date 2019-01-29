require('../../test-utils/mock-implementations')
const { eventsPost } = require('./controller')
const { waitForInternalPromises } = require('../../test-utils')
const { readConfig, updateConfig } = require('../../bot-config')
const { mockMessageApi, mockPublicMessageApi } = require('../../test-utils/mock-api')
const { mockConfig, mockInitialDeployment, mockBranchDeployment, mockBranchBuild, mockStagingBuild, mockProductionBuild } = require('../../test-utils/mock-data')
const { branchBuildManagerView, stagingBuildManagerView, productionBuildChannelView } = require('./views')
const { branchBuildView } = require('../config/views')
const { DeploymentStatus } = require('../request/mappings')
const { eventRequestGenerator } = require('./test-utils')
const { handleIfBranchBuildEvent, handleIfStagingBuildEvent, handleIfProductionBuildEvent } = require('./build-events')

describe('Events controller', async () => {
  const generateRequest = eventRequestGenerator('bot_message', mockConfig.deployChannel.id)

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
    /** mock api **/
    const chatApi = mockMessageApi(message => {
      expect(message).toMatchObject(stagingBuildManagerView(mockStagingBuild))
      return true
    })

    await updateConfig({
      deployments: {
        [mockBranchDeployment.id]: mockBranchDeployment
      }
    })
    await handleIfStagingBuildEvent(mockStagingBuild)
    await waitForInternalPromises()

    const { deployments } = await readConfig()
    const deployment = deployments[mockBranchDeployment.id]

    expect(chatApi.isDone()).toBe(true)
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
