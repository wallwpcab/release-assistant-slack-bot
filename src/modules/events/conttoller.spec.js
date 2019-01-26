require('../../test-utils/mock-implementations')
const { eventsPost } = require('./controller')
const { getSlackChannelId } = require('../../utils')
const { waitForInternalPromises } = require('../../test-utils')
const { readConfig, updateConfig } = require('../../bot-config')
const { mockPostMessageApi } = require('../../test-utils/mock-api')
const { mockConfig } = require('../../test-utils/mock-data')
const { releaseManagerUpdatedView } = require('./views')

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
})
