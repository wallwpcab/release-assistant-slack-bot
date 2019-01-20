const { mockSlackApiUrl } = require('../../test-utils/mock-implementations')
const { postActions } = require('./controller')
const { requestMapping } = require('../request/mappings')
const { configMapping } = require('../config/mappings')
const { mockRequestFormData, mockRequest, mockUser, mockConfig, mockFile } = require('../../test-utils/mock-data')
const { readConfig, updateConfig } = require('../../bot-config')
const { waitForInternalPromises } = require('../../test-utils')
const { mockFilesUploadApi, mockChatPostMessageApi, mockPostMessageApi } = require('../../test-utils/mock-api')

describe('Actions controller', async () => {
  beforeAll(async () => {
    await updateConfig(mockConfig, true)
  })

  it('can handle dialog action', async () => {
    const responseUrl = 'http://response.slack.com/message'
    const req = {
      body: {
        payload: JSON.stringify({
          type: 'dialog_submission',
          callback_id: requestMapping.callback_id,
          response_url: responseUrl,
          submission: mockRequestFormData,
          user: mockUser
        })
      }
    }

    const res = {
      send: jest.fn()
    }

    // start mock api
    mockSlackApiUrl()
    const fileApi = mockFilesUploadApi()
    const chatApi = mockChatPostMessageApi(
      ({ text, channel }) => /^\S+/.test(text) && /^\S+/.test(channel)
    )
    const messageApi = mockPostMessageApi(
      responseUrl,
      ({ text }) => /^\S+/.test(text)
    )

    // simulate controller method call
    await postActions(req, res)
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

  it('can handle edit dialog action', async () => {
    const responseUrl = 'http://response.slack.com/message'
    const req = {
      body: {
        payload: JSON.stringify({
          type: 'dialog_submission',
          callback_id: configMapping.callback_id,
          response_url: responseUrl,
          submission: {
            config: JSON.stringify(mockConfig)
          }
        })
      }
    }

    const res = {
      send: jest.fn()
    }

    // start mock api
    const messageApi = mockPostMessageApi(
      responseUrl,
      ({ text }) => /^\S+/.test(text)
    )

    // reset config
    await updateConfig({}, true)

    // simulate controller method call
    await postActions(req, res)
    await waitForInternalPromises()
    const config = await readConfig()

    // should call following api
    expect(messageApi.isDone()).toBe(true)

    // config should be updated
    expect(config).toEqual(mockConfig)
  })
})
