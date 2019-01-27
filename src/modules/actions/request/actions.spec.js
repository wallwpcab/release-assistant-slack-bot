const { mockSlackApiUrl, setMockId, setMockDate } = require('../../../test-utils/mock-implementations')
const { actionsPost } = require('../controller')
const { generateDialogRequest, generateActionRequest } = require('../test-utils')
const { Request, RequestApproval } = require('../../request/mappings')
const { readConfig, updateConfig } = require('../../../bot-config')
const { waitForInternalPromises } = require('../../../test-utils')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../../request/views')
const {
  requestReceivedAuthorView,
  requestReceivedManagerView,
  requestInitiatedChannelView
} = require('./views')
const {
  mockRequestFormData,
  mockInitialRequest,
  mockApprovedRequest,
  mockUser,
  mockConfig,
  mockApprover,
  mockRejector,
  mockChannel,
  mockFile
} = require('../../../test-utils/mock-data')
const {
  mockChatPostMessageApi,
  mockChatPostEphemeralApi,
  mockPostMessageApi,
  mockGitProductionApi,
  mockFilesCommentsAddApi,
  mockFilesUploadApi
} = require('../../../test-utils/mock-api')

const responseUrl = 'http://response.slack.com/message'
const dialogRequest = generateDialogRequest(responseUrl, mockUser)
const actionRequest = generateActionRequest(
  RequestApproval.callback_id,
  mockUser
)

describe('Request actions', async () => {
  beforeEach(async () => {
    const requests = {
      [mockInitialRequest.id]: mockInitialRequest
    }
    await updateConfig({ ...mockConfig, requests }, true)
  })

  it('Can handle dialog action', async () => {
    const req = dialogRequest(
      Request.callback_id,
      mockRequestFormData
    )

    const res = {
      send: jest.fn()
    }

    setMockId(mockInitialRequest.id)
    const date = setMockDate(new Date().toISOString())

    // generate a different slack api url
    mockSlackApiUrl()

    /** mock api **/
    const fileApi = mockFilesUploadApi()
    const chatApi = mockChatPostMessageApi(({ text, channel }) => {
      expect(text).toBe(requestReceivedManagerView(mockInitialRequest).text)
      expect(channel).toBe(mockChannel.id)
      return true
    })

    const messageApi = mockPostMessageApi(
      responseUrl,
      ({ text }) => {
        expect(text).toBe(requestReceivedAuthorView(mockInitialRequest).text)
        return true
      }
    )
    /** mock api **/

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()
    const { requests } = await readConfig()
    const [request] = Object.values(requests)

    // should call following api
    expect(fileApi.isDone()).toBe(true)
    expect(chatApi.isDone()).toBe(true)
    expect(messageApi.isDone()).toBe(true)

    // request should contain mockInitialRequest data
    expect(request).toMatchObject({
      ...mockInitialRequest,
      id: request.id,
      date
    })

    // request should contain user data
    expect(request.user).toEqual(mockUser)

    // request should contain file data
    expect(request.file).toEqual(mockFile)
  })

  it('Can handle initiate request action with invalid request id', async () => {
    const requestId = 'invalid-id'
    const req = actionRequest(
      RequestApproval.approve,
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

  it('Can handle initiate request action for already initiated request', async () => {
    const requests = {
      [mockApprovedRequest.id]: mockApprovedRequest
    }
    await updateConfig({ requests }, true)

    const req = actionRequest(
      RequestApproval.approve,
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

  it('Can handle initiate request action', async () => {
    const actionRequest = generateActionRequest(
      RequestApproval.callback_id,
      mockApprover
    )

    const req = actionRequest(
      RequestApproval.approve,
      mockInitialRequest.id
    )
    const res = {
      send: jest.fn()
    }

    setMockId('dep-1')

    // start mock api
    mockSlackApiUrl()

    /** mock api **/
    const filesCommentsApi = mockFilesCommentsAddApi()
    const gitApi = mockGitProductionApi()
    const chatApi = mockChatPostMessageApi(
      ({ text, channel }) => /initiated/.test(text) && /^\S+/.test(channel)
    )

    const chatApiForUsers = mockChatPostMessageApi(
      ({ text, channel }) => /initiated/.test(text) && /^\S+/.test(channel)
    )

    const messageApi = mockPostMessageApi(
      mockConfig.botChannelWebhook,
      ({ text }) => {
        expect(text).toBe(requestInitiatedChannelView(mockInitialRequest, mockApprover).text)
        return true
      }
    )
    /** mock api **/

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(chatApi.isDone()).toBe(true)
    expect(chatApiForUsers.isDone()).toBe(true)
    expect(messageApi.isDone()).toBe(true)
    expect(gitApi.isDone()).toBe(true)
    expect(filesCommentsApi.isDone()).toBe(true)

    // request should contain mockApprovedRequest data
    const { requests } = await readConfig()
    const [request] = Object.values(requests)
    expect(request).toMatchObject({
      ...mockApprovedRequest,
      id: request.id
    })
  })

  it('Can handle reject request action with invalid request id', async () => {
    const requestId = 'invalid-id'
    const req = actionRequest(
      RequestApproval.reject,
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

  it('Can handle reject request action for already initiated request', async () => {
    const requests = {
      [mockApprovedRequest.id]: mockApprovedRequest
    }
    await updateConfig({ requests }, true)

    const req = actionRequest(
      RequestApproval.reject,
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

  it('Can handle reject request action', async () => {
    const actionRequest = generateActionRequest(
      RequestApproval.callback_id,
      mockRejector
    )
    const req = actionRequest(
      RequestApproval.reject,
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

    // request should not contain mockApprovedRequest data
    expect(requests[mockApprovedRequest.id]).toBe(undefined)

    // should call following api
    expect(chatApi.isDone()).toBe(true)
    expect(chatApiForUsers.isDone()).toBe(true)
    expect(filesCommentsApi.isDone()).toBe(true)
  })
})
