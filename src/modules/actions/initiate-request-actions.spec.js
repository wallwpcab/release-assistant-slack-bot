const { mockSlackApiUrl } = require('../../test-utils/mock-implementations')
const { postActions } = require('./controller')
const { approvalMapping } = require('../request/mappings')
const { mockRequest, mockRequestInitiated, mockUser, mockConfig, mockInitiator } = require('../../test-utils/mock-data')
const { readConfig, updateConfig } = require('../../bot-config')
const { waitForInternalPromises } = require('../../test-utils')
const { generateActionRequest } = require('./test-utils')
const { mockChatPostMessageApi, mockChatPostEphemeralApi, mockPostMessageApi, mockGitProductionApi, mockFilesCommentsAddApi } = require('../../test-utils/mock-api')

const actionRequest = generateActionRequest(
  approvalMapping.callback_id,
  mockUser
)

describe('Initiate request actions', async () => {
  beforeEach(async () => {
    const requests = {
      [mockRequest.id]: mockRequest
    }
    await updateConfig({ ...mockConfig, requests }, true)
  })

  it('can handle initiate request action with invalid request id', async () => {
    const req = actionRequest(
      approvalMapping.initiate,
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
    await postActions(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('can handle initiate request action for already initiated request', async () => {
    const requests = {
      [mockRequestInitiated.id]: mockRequestInitiated
    }
    await updateConfig({ requests }, true)

    const req = actionRequest(
      approvalMapping.initiate,
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
    await postActions(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('can handle initiate request action', async () => {
    const actionRequest = generateActionRequest(
      approvalMapping.callback_id,
      mockInitiator
    )
    const req = actionRequest(
      approvalMapping.initiate,
      mockRequest.id
    )
    const res = {
      send: jest.fn()
    }

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
      ({ text }) => /initiated/.test(text)
    )
    /** mock api **/

    // simulate controller method call
    await postActions(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(chatApi.isDone()).toBe(true)
    expect(chatApiForUsers.isDone()).toBe(true)
    expect(messageApi.isDone()).toBe(true)
    expect(gitApi.isDone()).toBe(true)
    expect(filesCommentsApi.isDone()).toBe(true)

    // request should contain mockRequestInitiated data
    const { requests } = await readConfig()
    const [request] = Object.values(requests)
    expect(request).toMatchObject({
      ...mockRequestInitiated,
      id: request.id
    })
  })
})
