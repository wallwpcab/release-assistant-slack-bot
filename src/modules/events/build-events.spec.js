require('../../test-utils/mock-implementations')
const { eventsPost } = require('./controller')
const { getSlackChannelId } = require('../../utils')
const { waitForInternalPromises } = require('../../test-utils')
const { readConfig, updateConfig } = require('../../bot-config')
const { mockChatPostMessageApi } = require('../../test-utils/mock-api')
const { mockConfig, mockInitialDeployment, mockBranchDeployment, mockBranchBuild } = require('../../test-utils/mock-data')
const { branchBuildManagerView } = require('./views')
const { branchBuildView } = require('../config/views')
const { DeploymentStatus } = require('../request/mappings')

describe('Events controller', async () => {
  beforeEach(async () => {
    await updateConfig(mockConfig, true)
  })

  it('Can handle branch build event', async () => {
    const req = {
      body: {
        event: {
          type: 'message',
          subtype: 'bot_message',
          attachments: branchBuildView(mockBranchBuild.branch).attachments,
          channel: getSlackChannelId(mockConfig.deployChannel)
        }
      }
    }

    const res = {
      send: jest.fn()
    }

    /** mock api **/
    const chatApi = mockChatPostMessageApi(
      (message) => {
        expect(message).toMatchObject(branchBuildManagerView(mockBranchDeployment.build))
        return true
      }
    )

    await updateConfig({
      deployments: {
        [mockInitialDeployment.id]: mockInitialDeployment
      }
    })
    await eventsPost(req, res)
    await waitForInternalPromises()

    const { deployments } = await readConfig()
    const deployment = deployments[mockInitialDeployment.id]
    expect(deployment.status).toEqual(DeploymentStatus.branch)

    expect(chatApi.isDone()).toBe(true)
  })
})
