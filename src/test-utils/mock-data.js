const mcokHotfixRequest = {
  id: 'hotfix-req',
  requestType: 'hotfix',
  commits: 'sha1, sha2',
  description: 'Hotfix Reqest',
  approval: null,
  subscribers: '<@user1>, #bot'
}

const mockUser = {
  user: {
    id: 'user'
  }
}

const mockConfig = {
  botChannel: '<#GEL8D0QRG|release-bot-test>'
}

const mockFile = {
  id: 'file-1',
  permalink: 'http://files.com/file-1'
}

module.exports = {
  mockConfig,
  mcokHotfixRequest,
  mockUser,
  mockFile
}
