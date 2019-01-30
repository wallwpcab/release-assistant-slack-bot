require('../../../test-utils/mock-implementations')
const { actionsPost } = require('../controller')
const { generateActionRequest } = require('../test-utils')
const { RequestProgress } = require('../../progress/mappings')
const { readConfig, updateConfig } = require('../../../bot-config')
const { waitForInternalPromises } = require('../../../test-utils')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../../request/views')
const {
  requestCanceledManagerView,
  requestCanceledChannelView
} = require('./views')
const {
  mockInitialRequest,
  mockApprovedRequest,
  mockUser,
  mockConfig,
  mockChannel
} = require('../../../test-utils/mock-data')
const {
  mockMessageApi,
  mockEphemeralMessageApi
} = require('../../../test-utils/mock-api')

const actionRequest = generateActionRequest(
  RequestProgress.callback_id,
  mockUser
)

describe('Cancel request actions', async () => {
  beforeEach(async () => {
    const requests = {
      [mockInitialRequest.id]: mockInitialRequest
    }
    await updateConfig({ ...mockConfig, requests }, true)
  })

  it('Can handle cancel request action with invalid request id', async () => {
    const requestId = 'invalid-id'
    const req = actionRequest(
      requestId,
      RequestProgress.cancel
    )
    const res = {
      send: jest.fn()
    }

    /** mock api **/
    const messageApi = mockEphemeralMessageApi(({ text, channel }) => {
      expect(text).toBe(requestInvalidIdView(requestId).text)
      expect(channel).toBe(mockChannel.id)
      return true
    })

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle cancel request action for already initiated request', async () => {
    const requests = {
      [mockApprovedRequest.id]: mockApprovedRequest
    }
    await updateConfig({ requests }, true)

    const req = actionRequest(
      mockApprovedRequest.id,
      RequestProgress.cancel
    )

    const res = {
      send: jest.fn()
    }

    /** mock api **/
    const messageApi = mockEphemeralMessageApi(({ text, channel }) => {
      expect(text).toBe(requestAlreadyInitiatedView(mockApprovedRequest).text)
      expect(channel).toBe(mockChannel.id)
      return true
    })

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle cancel request action', async () => {
    const req = actionRequest(
      mockInitialRequest.id,
      RequestProgress.cancel
    )

    const res = {
      send: jest.fn()
    }

    const messageApiCallback = ({ text }) => {
      expect([
        requestCanceledManagerView(mockInitialRequest, mockUser).text,
        requestCanceledChannelView(mockUser).text
      ]).toContain(text)
      return true
    }

    /** mock api **/
    const userMessageApi = mockMessageApi(messageApiCallback)
    const channelMessageApi = mockMessageApi(messageApiCallback)
    /** mock api **/

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()

    const { requests } = await readConfig()

    // request should not contain mockApprovedRequest data
    expect(requests[mockApprovedRequest.id]).toBe(undefined)

    // should call following api
    expect(userMessageApi.isDone()).toBe(true)
    expect(channelMessageApi.isDone()).toBe(true)
  })
})
