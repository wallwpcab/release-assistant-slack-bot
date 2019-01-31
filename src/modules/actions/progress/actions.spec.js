require('../../../test-utils/mock-implementations')
const { handleIfRequestProgressAction } = require('./actions')
const { RequestProgress } = require('../../progress/mappings')
const { readState, updateState } = require('../../../bot-state')
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
  mockState
} = require('../../../test-utils/mock-data')
const {
  mockMessageApi,
  mockEphemeralMessageApi
} = require('../../../test-utils/mock-api')

const actionPayload = (name, value) => ({
  callback_id: RequestProgress.callback_id,
  user: mockUser,
  actions: [
    {
      name,
      value
    }
  ]
})

describe('Cancel request actions', async () => {
  beforeEach(async () => {
    const requests = {
      [mockInitialRequest.id]: mockInitialRequest
    }
    await updateState({ ...mockState, requests }, true)
  })

  it('Can handle cancel request action with invalid request id', async () => {
    const requestId = 'invalid-id'

    /** mock api **/
    const messageApi = mockEphemeralMessageApi(({ text }) => {
      expect(text).toBe(requestInvalidIdView(requestId).text)
      return true
    })

    // simulate
    await handleIfRequestProgressAction(actionPayload(requestId, RequestProgress.cancel))
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle cancel request action for already initiated request', async () => {
    const requests = {
      [mockApprovedRequest.id]: mockApprovedRequest
    }
    await updateState({ requests }, true)

    /** mock api **/
    const messageApi = mockEphemeralMessageApi(({ text }) => {
      expect(text).toBe(requestAlreadyInitiatedView(mockApprovedRequest).text)
      return true
    })

    // simulate
    await handleIfRequestProgressAction(actionPayload(mockApprovedRequest.id, RequestProgress.cancel))
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle cancel request action', async () => {
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

    // simulate
    await handleIfRequestProgressAction(actionPayload(mockInitialRequest.id, RequestProgress.cancel))
    await waitForInternalPromises()

    const { requests } = await readState()

    // request should not contain mockApprovedRequest data
    expect(requests[mockApprovedRequest.id]).toBe(undefined)

    // should call following api
    expect(userMessageApi.isDone()).toBe(true)
    expect(channelMessageApi.isDone()).toBe(true)
  })
})
