const { mockSlackApiUrl } = require('../../test-utils/mock-implementations')
const { actionsPost } = require('./controller')
const { Request } = require('../request/mappings')
const { Config } = require('../config/mappings')
const { requestReceivedAuthorView, requestReceivedManagerView } = require('../request/views')
const { configReadView } = require('../config/views')
const { mockRequestFormData, mockRequest, mockUser, mockConfig, mockFile, mockChannel } = require('../../test-utils/mock-data')
const { readConfig, updateConfig } = require('../../bot-config')
const { waitForInternalPromises } = require('../../test-utils')
const { generateDialogRequest } = require('./test-utils')
const { mockFilesUploadApi, mockChatPostMessageApi, mockPostMessageApi } = require('../../test-utils/mock-api')

const responseUrl = 'http://response.slack.com/message'
const dialogRequest = generateDialogRequest(responseUrl, mockUser)

describe('Dialog actions', async () => {
  beforeAll(async () => {
    await updateConfig(mockConfig, true)
  })

  it('Can handle dialog action', async () => {
    const req = dialogRequest(
      Request.callback_id,
      mockRequestFormData
    )

    const res = {
      send: jest.fn()
    }

    const updatedMockRequest = { ...mockRequest, id: 'id-1' }

    // generate a different slack api url
    mockSlackApiUrl()

    /** mock api **/
    const fileApi = mockFilesUploadApi()
    const chatApi = mockChatPostMessageApi(({ text, channel }) => {
      expect(text).toBe(requestReceivedManagerView(updatedMockRequest).text)
      expect(channel).toBe(mockChannel.id)
      return true
    }
    )

    const messageApi = mockPostMessageApi(
      responseUrl,
      ({ text }) => {
        expect(text).toBe(requestReceivedAuthorView(updatedMockRequest).text)
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

    // request should contain mockRequest data
    expect(request).toMatchObject({
      ...mockRequest,
      id: request.id
    })

    // request should contain user data
    expect(request.user).toEqual(mockUser)

    // request should contain file data
    expect(request.file).toEqual(mockFile)
  })

  it('Can handle edit dialog action', async () => {
    const req = dialogRequest(
      Config.callback_id,
      {
        config: JSON.stringify(mockConfig)
      }
    )

    const res = {
      send: jest.fn()
    }

    /** mock api **/
    const messageApi = mockPostMessageApi(
      responseUrl,
      ({ text }) => {
        expect(text).toBe(configReadView(mockConfig).text)
        return true
      }
    )

    // reset config
    await updateConfig({}, true)

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()
    const config = await readConfig()

    // should call following api
    expect(messageApi.isDone()).toBe(true)

    // config should be updated
    expect(config).toEqual(mockConfig)
  })
})
