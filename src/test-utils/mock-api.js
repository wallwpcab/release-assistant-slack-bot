const Nock = require('nock')
const config = require('config')

const { mockFile } = require('./mock-data')

const { apiUrl } = config.get('slack')

const nock = Nock(apiUrl)
  .defaultReplyHeaders({ 'access-control-allow-origin': '*' })

const mockFileUploadApi = (callback) => {
  const filePayload = {
    filename: /^\S+/,
    title: /^\S+/,
    content: /^\S+/,
    filetype: /^\S+/,
    channels: /^\S+/
  }

  return nock
    .post('/files.upload', callback ? callback : filePayload)
    .reply(200, {
      file: mockFile
    })
}

module.exports = {
  mockFileUploadApi
}
