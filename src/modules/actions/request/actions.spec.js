const { setMockId, setMockDate } = require('../../../test-utils/mock-implementations')
const { actionsPost } = require('../controller')
const { generateDialogRequest, generateActionRequest } = require('../test-utils')
const { Request, RequestApproval } = require('../../request/mappings')
const { readConfig, updateConfig } = require('../../../bot-config')
const { waitForInternalPromises } = require('../../../test-utils')
const { updateObject } = require('./utils')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../../request/views')
const {
  requestReceivedAuthorView,
  requestReceivedManagerView,
  requestInitiatedManagerView,
  requestInitiatedChannelView,
  requestRejectedManagerView,
  requestRejectedChannelView,
} = require('./views')
const {
  mockApprovedRequest,
  mockApprover,
  mockChannel,
  mockConfig,
  mockFile,
  mockInitialDeployment,
  mockInitialRequest,
  mockRejector,
  mockRequestFormData,
  mockUser
} = require('../../../test-utils/mock-data')
const {
  mockMessageApi,
  mockEphemeralMessageApi,
  mockPublicMessageApi,
  mockGitProductionApi,
  mockFileApi
} = require('../../../test-utils/mock-api')

const responseUrl = 'http://response.slack.com/message'
const dialogRequest = generateDialogRequest(responseUrl, mockUser)
const actionRequest = generateActionRequest(
  RequestApproval.callback_id,
  mockUser
)

describe('My Request actions', async () => {
  beforeEach(async () => {
    const requests = updateObject({}, mockInitialRequest)
    await updateConfig({ ...mockConfig, requests }, true)
  })

  it('Can handle a dialog action', async () => {
    const req = dialogRequest(
      Request.callback_id,
      mockRequestFormData
    )

    const res = {
      send: jest.fn()
    }

    setMockId(mockInitialRequest.id)
    setMockDate(new Date('2019-01-27T18:13:15.249Z').toISOString())


    /** mock api **/
    const fileApi = mockFileApi()
    const messageApi = mockMessageApi(({ text, channel }) => {
      expect(text).toBe(requestReceivedManagerView(mockInitialRequest).text)
      expect(channel).toBe(mockChannel.id)
      return true
    })

    const publicMessageApi = mockPublicMessageApi(
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
    const req = actionRequest(
      RequestApproval.approve,
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

    const allRequests = {
      [mockInitialRequest.id]: mockInitialRequest,
      [mockApprovedRequest.id]: mockApprovedRequest
    }

    const messageApiCallback = ({ text }) => {
      expect([
        requestInitiatedManagerView(mockInitialDeployment, allRequests, mockApprover).text,
        requestInitiatedChannelView(mockInitialRequest, mockApprover).text
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

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(gitApi.isDone()).toBe(true)
    expect(userMessageApi.isDone()).toBe(true)
    expect(channelMessageApi.isDone()).toBe(true)

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

    const messageApiCallback = ({ text }) => {
      expect([
        requestRejectedManagerView(mockInitialRequest, mockRejector).text,
        requestRejectedChannelView(mockInitialRequest, mockRejector).text
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
