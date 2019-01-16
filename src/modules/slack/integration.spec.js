require('../../test-utils/mock-implementations')

const { updateConfig } = require('../../bot-config')
const { uploadRequestData } = require('../slack/integration')
const { mockFileUploadApi } = require('../../test-utils/mock-api')
const { mcokHotfixRequest, mockConfig, mockFile } = require('../../test-utils/mock-data')


describe('Slack integration', async () => {
  beforeAll(async () => {
    await updateConfig(mockConfig)
  })

  it('Upload Request', async () => {
    const fileApi = mockFileUploadApi()
    const file = await uploadRequestData(mcokHotfixRequest)
    expect(fileApi.isDone()).toBe(true)
    expect(file).toEqual(mockFile)
  })
})
