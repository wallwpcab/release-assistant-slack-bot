const { mockSlackApiUrl } = require('../../test-utils/mock-implementations')
const { actionsPost } = require('./controller')
const { approvalMapping } = require('../request/mappings')
const { mockRequest, mockRequestInitiated, mockUser, mockConfig, mockRejector } = require('../../test-utils/mock-data')
const { readConfig, updateConfig } = require('../../bot-config')
const { waitForInternalPromises } = require('../../test-utils')
const { generateActionRequest } = require('./test-utils')
const { mockChatPostMessageApi, mockChatPostEphemeralApi, mockFilesCommentsAddApi } = require('../../test-utils/mock-api')

const actionRequest = generateActionRequest(
  approvalMapping.callback_id,
  mockUser
)

describe('Reject request actions', async () => {
  beforeEach(async () => {
    const requests = {
      [mockRequest.id]: mockRequest
    }
    await updateConfig({ ...mockConfig, requests }, true)
  })

  it('can handle reject request action with invalid request id', async () => {
    const req = actionRequest(
      approvalMapping.reject,
      'invalid-id'
    )
    const res = {
      send: jest.fn()
    }

    // generate a different slack api url
    mockSlackApiUrl()

    /** mock api **/
    const messageApi = mockChatPostEphemeralApi(
      ({ text, channel }) => /is invalid/.test(text) && /^\S+/.test(channel)
    )

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('can handle reject request action for already initiated request', async () => {
    const requests = {
      [mockRequestInitiated.id]: mockRequestInitiated
    }
    await updateConfig({ requests }, true)

    const req = actionRequest(
      approvalMapping.reject,
      mockRequestInitiated.id
    )
    const res = {
      send: jest.fn()
    }

    // generate a different slack api url
    mockSlackApiUrl()

    /** mock api **/
    const messageApi = mockChatPostEphemeralApi(
      ({ text, channel }) => /already initiated/.test(text) && /^\S+/.test(channel)
    )

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('can handle reject request action', async () => {
    const actionRequest = generateActionRequest(
      approvalMapping.callback_id,
      mockRejector
    )
    const req = actionRequest(
      approvalMapping.reject,
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
      ({ text, channel }) => /rejected/.test(text) && /^\S+/.test(channel)
    )

    const chatApiForUsers = mockChatPostMessageApi(
      ({ text, channel }) => /rejected/.test(text) && /^\S+/.test(channel)
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
