const { mockSlackApiUrl } = require('../../test-utils/mock-implementations')
const { actionsPost } = require('./controller')
const { generateActionRequest } = require('./test-utils')
const { cancelRequestMappings } = require('../progress/mappings')
const { readConfig, updateConfig } = require('../../bot-config')
const { waitForInternalPromises } = require('../../test-utils')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../request/views')
const {
  mockRequest,
  mockRequestInitiated,
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
  cancelRequestMappings.callback_id,
  mockUser
)

describe('Cancel request actions', async () => {
  beforeEach(async () => {
    const requests = {
      [mockRequest.id]: mockRequest
    }
    await updateConfig({ ...mockConfig, requests }, true)
  })

  it('can handle cancel request action with invalid request id', async () => {
    const requestId = 'invalid-id'
    const req = actionRequest(
      cancelRequestMappings.yes,
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

  it('can handle cancel request action for already initiated request', async () => {
    const requests = {
      [mockRequestInitiated.id]: mockRequestInitiated
    }
    await updateConfig({ requests }, true)


    const req = actionRequest(
      cancelRequestMappings.yes,
      mockRequestInitiated.id
    )
    const res = {
      send: jest.fn()
    }

    // generate a different slack api url
    mockSlackApiUrl()

    /** mock api **/
    const messageApi = mockChatPostEphemeralApi(({ text, channel }) => {
      expect(text).toBe(requestAlreadyInitiatedView(mockRequestInitiated).text)
      expect(channel).toBe(mockChannel.id)
      return true
    })

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('can handle cancel request action', async () => {
    const req = actionRequest(
      cancelRequestMappings.yes,
      mockRequest.id
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

    // request should not contain mockRequestInitiated data
    expect(requests[mockRequestInitiated.id]).toBe(undefined)

    // should call following api
    expect(chatApi.isDone()).toBe(true)
    expect(chatApiForUsers.isDone()).toBe(true)
    expect(filesCommentsApi.isDone()).toBe(true)
  })
})
