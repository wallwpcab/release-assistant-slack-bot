require('../../test-utils/mock-implementations')
const { eventsPost } = require('./controller')
const { getSlackUser } = require('../../utils')
const { waitForInternalPromises, expressHelper } = require('../../test-utils')
const { readState, updateState } = require('../../bot-state')
const { mockMessageApi } = require('../../test-utils/mock-api')
const { mockState } = require('../../test-utils/mock-data')
const { releaseManagerUpdatedManagerView, releaseManagerUpdatedChannelView } = require('../build/event-views')

const eventRequestGenerator = (subtype, channel) => props => ({
  body: {
    event: {
      type: 'message',
      subtype,
      channel,
      ...props
    }
  }
})

describe('Events controller', async () => {
  beforeEach(async () => {
    await updateState(mockState, true)
  })

  it('Can send-back slack challenge', async () => {
    const http = expressHelper({
      challenge: 'challenge-1'
    })

    await eventsPost(...http.args)
    await waitForInternalPromises()

    expect(http.res.send).toBeCalledWith('challenge-1')
  })

  it('Can handle channel topic change event', async () => {
    const author = '<@USER1|Fred>'
    const managers = ['<@USER2|Kerl>']
    const generateRequest = eventRequestGenerator('group_topic', mockState.config.releaseChannel.id)
    const req = generateRequest({
      text: `${author} set topic to: ${managers.join(', ')} are DevOps for this week`,
      topic: `${managers.join(', ')} are DevOps for this week`
    })

    const res = {
      send: jest.fn()
    }

    const user = getSlackUser(author)
    const users = managers.map(u => getSlackUser(u))

    const messageApiCallback = ({ text }) => {
      expect([
        releaseManagerUpdatedChannelView(user, users).text,
        releaseManagerUpdatedManagerView(users).text
      ]).toContain(text)
      return true
    }

    /* mock api */
    const userMessageApi = mockMessageApi(messageApiCallback)
    const channelMessageApi = mockMessageApi(messageApiCallback)
    /* mock api */

    await eventsPost(req, res)
    await waitForInternalPromises()

    expect(userMessageApi.isDone()).toEqual(true)
    expect(channelMessageApi.isDone()).toEqual(true)
    const { config } = await readState()
    expect(config.releaseManagers).toEqual(users)
  })
})
