const { setMockId, setMockDate } = require('../../test-utils/mock-implementations')
const { Request, RequestApproval } = require('./mappings')
const { readState, updateState } = require('../../bot-state')
const { waitForInternalPromises } = require('../../test-utils')
const { updateById } = require('../../utils')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('./views')
const {
  requestReceivedAuthorView,
  requestReceivedManagerView,
  requestInitiatedManagerView,
  requestInitiatedChannelView,
  requestRejectedManagerView,
  requestRejectedChannelView,
} = require('./action-views')
const {
  handleIfRequestDialogAction,
  handleIfInitiateRequestAction,
  handleIfRejectRequestAction
} = require('./actions')
const {
  mockApprovedRequest,
  mockUser,
  mockChannel,
  mockState,
  mockFile,
  mockInitialDeployment,
  mockInitialRequest,
  mockRequestFormData
} = require('../../test-utils/mock-data')
const {
  mockMessageApi,
  mockEphemeralMessageApi,
  mockPublicMessageApi,
  mockGitProductionApi,
  mockFileApi,
  mockPermalinkApi
} = require('../../test-utils/mock-api')

const responseUrl = 'http://response.slack.com/message'

const actionPayload = (name, value) => ({
  callback_id: RequestApproval.callback_id,
  user: mockUser,
  actions: [
    {
      name,
      value
    }
  ]
})

describe('Request actions', async () => {
  beforeEach(async () => {
    const requests = updateById({}, mockInitialRequest)
    await updateState({ ...mockState, requests }, true)
  })

  it('Can handle a dialog action', async () => {
    const payload = {
      callback_id: Request.callback_id,
      response_url: responseUrl,
      submission: mockRequestFormData,
      user: mockUser
    }

    setMockId(mockInitialRequest.id)
    setMockDate(new Date('2019-01-27T18:13:15.249Z').toISOString())

    /** mock api **/
    const fileApi = mockFileApi()
    const permalinkApi = mockPermalinkApi()
    const messageApi = mockMessageApi(({ text, channel }) => {
      expect(text).toBe(requestReceivedManagerView(mockInitialRequest).text)
      expect(channel).toBe(mockChannel.id)
      return true
    })

    const publicMessageApi = mockPublicMessageApi(responseUrl, ({ text }) => {
      expect(text).toBe(requestReceivedAuthorView(mockInitialRequest).text)
      return true
    }
    )
    /** mock api **/

    // simulate
    await handleIfRequestDialogAction(payload)
    await waitForInternalPromises()
    const { requests } = await readState()
    const [request] = Object.values(requests)

    // should call following api
    expect(fileApi.isDone()).toBe(true)
    expect(permalinkApi.isDone()).toBe(true)
    expect(messageApi.isDone()).toBe(true)
    expect(publicMessageApi.isDone()).toBe(true)

    // request should contain mockInitialRequest data
    expect(request).toMatchObject({
      ...mockInitialRequest,
      id: request.id
    })

    // request should contain user data
    expect(request.user).toEqual(mockUser)

    // request should contain file data
    expect(request.file).toEqual(mockFile)
  })

  it('Can handle initiate request action with invalid request id', async () => {
    const requestId = 'invalid-id'

    /** mock api **/
    const messageApi = mockEphemeralMessageApi(({ text }) => {
      expect(text).toBe(requestInvalidIdView(requestId).text)
      return true
    })
    /** mock api **/

    // simulate
    await handleIfInitiateRequestAction(actionPayload(requestId, RequestApproval.approve))
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle initiate request action for already initiated request', async () => {
    const requests = {
      [mockApprovedRequest.id]: mockApprovedRequest
    }
    await updateState({ requests }, true)

    /** mock api **/
    const messageApi = mockEphemeralMessageApi(({ text }) => {
      expect(text).toBe(requestAlreadyInitiatedView(mockApprovedRequest).text)
      return true
    })
    /** mock api **/

    // simulate
    await handleIfInitiateRequestAction(actionPayload(mockApprovedRequest.id, RequestApproval.approve))
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle initiate request action', async () => {
    const messageApiCallback = ({ text }) => {
      expect([
        requestInitiatedManagerView(mockInitialDeployment, mockUser).text,
        requestInitiatedChannelView(mockInitialDeployment, mockUser).text
      ]).toContain(text)
      return true
    }

    setMockId('dep-1')
    setMockDate(new Date('2018-10-14').toISOString())

    /** mock api **/
    const gitApi = mockGitProductionApi()
    const userMessageApi = mockMessageApi(messageApiCallback)
    const channelMessageApi = mockMessageApi(messageApiCallback)
    /** mock api **/

    // simulate
    await handleIfInitiateRequestAction(actionPayload(mockInitialRequest.id, RequestApproval.approve))
    await waitForInternalPromises()

    // should call following api
    expect(gitApi.isDone()).toBe(true)
    expect(userMessageApi.isDone()).toBe(true)
    expect(channelMessageApi.isDone()).toBe(true)

    // request should contain mockApprovedRequest data
    const { requests } = await readState()
    const [request] = Object.values(requests)
    expect(request).toMatchObject({
      ...mockApprovedRequest,
      id: request.id
    })
  })

  it('Can handle reject request action with invalid request id', async () => {
    const requestId = 'invalid-id'

    /** mock api **/
    const messageApi = mockEphemeralMessageApi(({ text }) => {
      expect(text).toBe(requestInvalidIdView(requestId).text)
      return true
    })

    // simulate
    await handleIfRejectRequestAction(actionPayload(requestId, RequestApproval.reject))
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle reject request action for already initiated request', async () => {
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
    await handleIfRejectRequestAction(actionPayload(mockApprovedRequest.id, RequestApproval.reject))
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle reject request action', async () => {
    const messageApiCallback = ({ text }) => {
      expect([
        requestRejectedManagerView(mockInitialRequest, mockUser).text,
        requestRejectedChannelView(mockInitialRequest, mockUser).text
      ]).toContain(text)
      return true
    }

    /** mock api **/
    const userMessageApi = mockMessageApi(messageApiCallback)
    const channelMessageApi = mockMessageApi(messageApiCallback)
    /** mock api **/

    // simulate
    await handleIfRejectRequestAction(actionPayload(mockInitialRequest.id, RequestApproval.reject))
    await waitForInternalPromises()

    const { requests } = await readState()

    // request should not contain mockApprovedRequest data
    expect(requests[mockApprovedRequest.id]).toBe(undefined)

    // should call following api
    expect(userMessageApi.isDone()).toBe(true)
    expect(channelMessageApi.isDone()).toBe(true)
  })
})
