require('../../test-utils/mock-implementations')
const { postActions } = require('./controller')
const { requestMapping } = require('../request/mappings')
const { mcokHotfixRequest, mockUser, mockConfig, mockFile } = require('../../test-utils/mock-data')
const { readConfig, updateConfig } = require('../../bot-config')
const { waitForInternalPromises } = require('../../test-utils')
const { splitValues } = require('../../utils')
const { mockFileUploadApi } = require('../../test-utils/mock-api')

describe('Actions controller', async () => {
  beforeAll(async () => {
    await updateConfig(mockConfig)
  })


  it('can handle dialog action', async () => {
    const req = {
      body: {
        payload: JSON.stringify({
          type: 'dialog_submission',
          callback_id: requestMapping.callback_id,
          response_url: 'http://response.slack.com',
          submission: mcokHotfixRequest,
          user: mockUser
        })
      }
    }

    const res = {
      send: jest.fn()
    }

    const fileApi = mockFileUploadApi()
    await postActions(req, res)
    await waitForInternalPromises()

    expect(fileApi.isDone()).toBe(true)
    const { requests } = await readConfig()
    const [request] = Object.values(requests)

    expect(request.type).toBe(mcokHotfixRequest.requestType)
    expect(request.commits).toEqual(splitValues(mcokHotfixRequest.commits))
    expect(request.description).toBe(mcokHotfixRequest.description)
    expect(request.subscribers).toEqual(splitValues(mcokHotfixRequest.subscribers))
    expect(request.user).toEqual(mockUser)
    expect(request.fileId).toBe(mockFile.id)
    expect(request.fileLink).toBe(mockFile.permalink)
  })
})
