require('../../test-utils/mock-implementations')

const { readConfig, updateConfig } = require('../../bot-config')
const { openDialog, sendMessage, sendMessageToUsers, postMessage, postMessageToBotChannel, uploadFile, uploadRequestData, addCommentOnFile } = require('../slack/integration')
const { mockDialogOpenApi, mockFilesUploadApi, mockChatPostMessageApi, mockChatPostEphemeralApi, mockPostMessageApi, mockFilesCommentsAddApi } = require('../../test-utils/mock-api')
const { mcokHotfixRequest, mockConfig, mockFile } = require('../../test-utils/mock-data')


describe('Slack integration', async () => {
  beforeAll(async () => {
    await updateConfig(mockConfig)
  })

  it('Open Dialog', async () => {
    const api = mockDialogOpenApi()
    const dialog = {
      title: 'Request a relesase',
      callback_id: '',
      submit_label: 'Submit',
      elements: [
        {
          label: 'Type',
          name: 'requestType',
          type: 'select',
          hint: 'Choose release type',
          options: { label: 'Option 1', value: 'option-1' },
          value: 'option-1'
        }
      ]
    }
    await openDialog('http://dialog.slack.com', dialog)
    expect(api.isDone()).toBe(true)
  })

  it('Send message', async () => {
    const api = mockChatPostMessageApi()
    await sendMessage('user-1', { text: 'test-message' })
    expect(api.isDone()).toBe(true)
  })

  it('Send ephemeral message', async () => {
    const api = mockChatPostEphemeralApi()
    await sendMessage('user-1', { text: 'test-message' }, true)
    expect(api.isDone()).toBe(true)
  })

  it('Send message to users', async () => {
    const api = mockChatPostMessageApi()
    await sendMessageToUsers(['<@user-1>'], { text: 'test-message' })
    expect(api.isDone()).toBe(true)
  })

  it('Post message', async () => {
    const url = 'http://message.slack.com/message'
    const api = mockPostMessageApi(url)
    await postMessage(url, { text: 'test-message' })
    expect(api.isDone()).toBe(true)
  })

  it('Post message to bot channel', async () => {
    const { botChannelWebhook } = await readConfig()
    const api = mockPostMessageApi(botChannelWebhook)
    await postMessageToBotChannel({ text: 'test-message' })
    expect(api.isDone()).toBe(true)
  })

  it('Can upload a file', async () => {
    const api = mockFilesUploadApi()
    const { file } = await uploadFile('test-file.txt', 'Test File', 'Some message', 'json', 'channel-1')
    expect(api.isDone()).toBe(true)
    expect(file).toEqual(mockFile)
  })

  it('Can upload a request file', async () => {
    const api = mockFilesUploadApi()
    const file = await uploadRequestData(mcokHotfixRequest)
    expect(api.isDone()).toBe(true)
    expect(file).toEqual(mockFile)
  })

  it('Add comment on file', async () => {
    const api = mockFilesCommentsAddApi()
    await addCommentOnFile('file-1', 'comment-1')
    expect(api.isDone()).toBe(true)
  })
})
