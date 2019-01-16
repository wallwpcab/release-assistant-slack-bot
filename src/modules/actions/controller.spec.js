require('../../test-utils/mock-implementations')
const { postActions } = require('./controller')
const { requestMapping } = require('../request/mappings')
const { mcokHotfixRequest, mockUser, mockConfig, mockFile } = require('../../test-utils/mock-data')
const { readConfig, updateConfig } = require('../../bot-config')
const { waitForInternalPromises } = require('../../test-utils')
const { splitValues } = require('../../utils')
const { mockFilesUploadApi, mockChatPostMessageApi, mockPostMessageApi } = require('../../test-utils/mock-api')

describe('Actions controller', async () => {
  beforeAll(async () => {
    await updateConfig(mockConfig)
  })

  it('can handle dialog action', async () => {
    const responseUrl = 'http://response.slack.com/message'
    const req = {
      body: {
        payload: JSON.stringify({
          type: 'dialog_submission',
          callback_id: requestMapping.callback_id,
          response_url: responseUrl,
          submission: mcokHotfixRequest,
          user: mockUser
        })
      }
    }

    const res = {
      send: jest.fn()
    }

    const fileApi = mockFilesUploadApi()
    const chatApi = mockChatPostMessageApi(
      ({ text, channel }) => /^\S+/.test(text) && /^\S+/.test(channel)
    )
    const messageApi = mockPostMessageApi(
      responseUrl,
      ({text}) => /^\S+/.test(text)
    )

    await postActions(req, res)
    await waitForInternalPromises()
    const { requests } = await readConfig()
    const [ request ] = Object.values(requests)

    // should call following api
    expect(fileApi.isDone()).toBe(true)
    expect(chatApi.isDone()).toBe(true)
    expect(messageApi.isDone()).toBe(true)

    // request should contain mcokHotfixRequest data
    expect(request).toMatchObject({
      type: mcokHotfixRequest.requestType,
      commits: splitValues(mcokHotfixRequest.commits),
      description: mcokHotfixRequest.description,
      subscribers: splitValues(mcokHotfixRequest.subscribers)
    })

    // request should contain user data
    expect(request.user).toEqual(mockUser)

    // request should contain file data
    expect(request).toMatchObject({
      fileId: mockFile.id,
      fileLink: mockFile.permalink
    })
  })
})
