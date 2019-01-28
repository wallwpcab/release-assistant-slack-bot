const { mockSlackApiUrl } = require('../../../test-utils/mock-implementations')
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
  mockInitialRequest,
  mockApprovedRequest,
  mockUser,
  mockConfig,
  mockChannel
} = require('../../../test-utils/mock-data')
const {
  mockMessageApi,
  mockEphemeralMessageApi,
  mockFilesCommentsAddApi
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
      RequestProgress.cancel,
      requestId
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
      RequestProgress.cancel,
      mockApprovedRequest.id
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
      RequestProgress.cancel,
      mockInitialRequest.id
    )

    const res = {
      send: jest.fn()
    }

    /** mock api **/
    const filesCommentsApi = mockFilesCommentsAddApi()
    const chatApi = mockMessageApi(
      ({ text, channel }) => /canceled/.test(text) && /^\S+/.test(channel)
    )

    const chatApiForUsers = mockMessageApi(
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
