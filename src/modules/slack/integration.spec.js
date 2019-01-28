require('../../test-utils/mock-implementations')
const { mockUser, mockMessage, mockChannel, mockFile, mockInitialRequest } = require('../../test-utils/mock-data')
const {
  addCommentOnFile,
  openDialog,
  sendEphemeralMessage,
  sendMessageOverUrl,
  sendMessageToChannel,
  sendMessageToUser,
  sendMessageToUsers,
  uploadFile,
  uploadRequestData
} = require('../slack/integration')
const {
  mockDialogOpenApi,
  mockEphemeralMessageApi,
  mockFileApi,
  mockFilesCommentsAddApi,
  mockMessageApi,
  mockPublicMessageApi,
} = require('../../test-utils/mock-api')

describe('Slack integration', async () => {
  it('Can open a dialog modal', async () => {
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

  it('Can send an ephemeral message to a user', async () => {
    const api = mockEphemeralMessageApi()
    await sendEphemeralMessage(mockUser, mockMessage)
    expect(api.isDone()).toBe(true)
  })

  it('Can send a message to a user', async () => {
    const api = mockMessageApi()
    await sendMessageToUser(mockUser, mockMessage)
    expect(api.isDone()).toBe(true)
  })

  it('Can send a message to users', async () => {
    const api = mockMessageApi()
    await sendMessageToUsers([mockUser], mockMessage)
    expect(api.isDone()).toBe(true)
  })

  it('Can send a message to a channel', async () => {
    const api = mockMessageApi()
    await sendMessageToChannel(mockChannel.id, mockMessage)
    expect(api.isDone()).toBe(true)
  })

  it('Can send a message over the url', async () => {
    const url = 'http://test.slack.com/message'
    const api = mockPublicMessageApi(url)
    await sendMessageOverUrl(url, mockMessage)
    expect(api.isDone()).toBe(true)
  })

  it('Can upload a file', async () => {
    const api = mockFileApi()
    const { file } = await uploadFile('test-file.txt', 'Some message', mockChannel.id, 'Test File', 'some comments', 'json')
    expect(api.isDone()).toBe(true)
    expect(file).toMatchObject({
      id: mockFile.id,
      permalink: mockFile.permalink
    })
  })

  it('Can upload a request file', async () => {
    const api = mockFileApi()
    const file = await uploadRequestData(mockInitialRequest, mockChannel.id, 'some comment')
    expect(api.isDone()).toBe(true)
    expect(file).toMatchObject(mockFile)
  })

  it('Can add comment on file', async () => {
    const api = mockFilesCommentsAddApi()
    await addCommentOnFile('file-1', 'comment-1')
    expect(api.isDone()).toBe(true)
  })
})
