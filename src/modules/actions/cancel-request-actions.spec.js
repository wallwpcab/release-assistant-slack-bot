const { mockSlackApiUrl } = require('../../test-utils/mock-implementations')
const { actionsPost } = require('./controller')
const { generateActionRequest } = require('./test-utils')
const { CancelRequest } = require('../progress/mappings')
const { readConfig, updateConfig } = require('../../bot-config')
const { waitForInternalPromises } = require('../../test-utils')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../request/views')
const {
  mockInitialRequest,
  mockApprovedRequest,
  mockUser,
  mockConfig,
  mockChannel
} = require('../../test-utils/mock-data')
const {
  mockChatPostMessageApi,
  mockChatPostEphemeralApi,
  mockFilesCommentsAddApi
} = require('../../test-utils/mock-api')

const actionRequest = generateActionRequest(
  CancelRequest.callback_id,
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
      CancelRequest.yes,
      requestId
    )
    const res = {
      send: jest.fn()
    }

    // generate a different slack api url
    mockSlackApiUrl()

    /** mock api **/
    const messageApi = mockChatPostEphemeralApi(({ text, channel }) => {
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
      CancelRequest.yes,
      mockApprovedRequest.id
    )

    const res = {
      send: jest.fn()
    }

    // generate a different slack api url
    mockSlackApiUrl()

    /** mock api **/
    const messageApi = mockChatPostEphemeralApi(({ text, channel }) => {
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
      CancelRequest.yes,
      mockInitialRequest.id
    )

    const res = {
      send: jest.fn()
    }

    // generate a different slack api url
    mockSlackApiUrl()

    /** mock api **/
    const filesCommentsApi = mockFilesCommentsAddApi()
    const chatApi = mockChatPostMessageApi(
      ({ text, channel }) => /canceled/.test(text) && /^\S+/.test(channel)
    )

    const chatApiForUsers = mockChatPostMessageApi(
      ({ text, channel }) => /canceled/.test(text) && /^\S+/.test(channel)
    )
    /** mock api **/

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()

    const { requests } = await readConfig()

    // request should not contain mockApprovedRequest data
    expect(requests[mockApprovedRequest.id]).toBe(undefined)

    // should call following api
    expect(chatApi.isDone()).toBe(true)
    expect(chatApiForUsers.isDone()).toBe(true)
    expect(filesCommentsApi.isDone()).toBe(true)
  })
})
