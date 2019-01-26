require('../../test-utils/mock-implementations')
const { eventsPost } = require('./controller')
const { getSlackChannelId } = require('../../utils')
const { waitForInternalPromises } = require('../../test-utils')
const { readConfig, updateConfig } = require('../../bot-config')
const { mockPostMessageApi, mockChatPostMessageApi } = require('../../test-utils/mock-api')
const { mockConfig, mockDeployment, mockBranchDeployment, mockBranchBuild } = require('../../test-utils/mock-data')
const { releaseManagerUpdatedView, branchBuildManagerView } = require('./views')
const { branchBuildView } = require('../config/views')
const { DeploymentStatus } = require('../request/mappings')

describe('Events controller', async () => {
  beforeEach(async () => {
    await updateConfig(mockConfig, true)
  })

  it('Can send-back slack challenge', async () => {
    const req = {
      body: {
        challenge: 'challenge-1'
      }
    }

    const res = {
      send: jest.fn()
    }

    await eventsPost(req, res)
    await waitForInternalPromises()

    expect(res.send).toBeCalledWith('challenge-1')
  })

  it('Can handle channel topic change event', async () => {
    const author = '<@USER1|Fred>'
    const managers = ['<@USER2|Kerl>']
    const req = {
      body: {
        event: {
          type: 'message',
          subtype: 'group_topic',
          text: `${author} set topic to: ${managers.join(', ')} are DevOps for this week`,
          topic: `${managers.join(', ')} are DevOps for this week`,
          channel: getSlackChannelId(mockConfig.botChannel)
        }
      }
    }

    const res = {
      send: jest.fn()
    }

    const messageApi = mockPostMessageApi(
      mockConfig.botChannelWebhook,
      ({ text }) => {
        expect(text).toBe(releaseManagerUpdatedView(author, managers).text)
        return true
      }
    )

    await eventsPost(req, res)
    await waitForInternalPromises()

    expect(messageApi.isDone()).toEqual(true)

    const { releaseManagers } = await readConfig();
    expect(releaseManagers).toEqual(managers)
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
        [mockDeployment.id]: mockDeployment
      }
    })
    await eventsPost(req, res)
    await waitForInternalPromises()

    const { deployments } = await readConfig()
    const deployment = deployments[mockDeployment.id]
    expect(deployment.status).toEqual(DeploymentStatus.branch)

    expect(chatApi.isDone()).toBe(true)
  })
})
