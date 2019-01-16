require('../src/test-utils/mock-implementations')
const nock = require('nock')

const { getStagingInfo, getProductionInfo, getGitInfo } = require('./git-integration')
const { updateConfig } = require('./bot-config')

const gitUrl = 'http://localhost'
const mockServer = nock(gitUrl)

const mockStagingApi = () => {
  mockServer.get('/staging')
    .reply(200, {
      info: {
        gitCommitAbbrev: 'b9c3b02',
        gitCommit: 'b9c3b0201c3ffd4218e6277d99be2c74dbb0f864'
      }
    })
}

const mockProductionApi = () => {
  mockServer.get('/production')
    .reply(200, {
      info: {
        gitCommitAbbrev: 'a9c3b03',
        gitCommit: 'a9c3b0201c3ffd4218e6277d99be2c74dbb0f865'
      }
    })
}

describe('Git Integration', () => {
  beforeAll(async () => {
    await updateConfig({
      stagingInfoUrl: `${gitUrl}/staging`,
      productionInfoUrl: `${gitUrl}/production`,
    })
  })

  it('Can get git staging info', async () => {
    mockStagingApi()
    const { info } = await getStagingInfo()
    expect(info).toEqual({
      gitCommitAbbrev: 'b9c3b02',
      gitCommit: 'b9c3b0201c3ffd4218e6277d99be2c74dbb0f864'
    })
  })

  it('Can handle exception on get git staging info', async () => {
    mockServer.get('/staging')
      .reply(500, {
        message: 'Error'
      })

    const result = await getStagingInfo()
    expect(result).toEqual({})
  })

  it('Can get git production info', async () => {
    mockProductionApi()
    const { info } = await getProductionInfo()
    expect(info).toEqual({
      gitCommitAbbrev: 'a9c3b03',
      gitCommit: 'a9c3b0201c3ffd4218e6277d99be2c74dbb0f865'
    })
  })

  it('Can handle exception on get git production info', async () => {
    mockServer.get('/production')
      .reply(500, {
        message: 'Error'
      })

    const result = await getProductionInfo()
    expect(result).toEqual({})
  })

  it('Can get git staging info based on the flag', async () => {
    mockStagingApi()
    const { info } = await getGitInfo()
    expect(info).toEqual({
      gitCommitAbbrev: 'b9c3b02',
      gitCommit: 'b9c3b0201c3ffd4218e6277d99be2c74dbb0f864'
    })
  })

  it('Can get git production info based on the flag', async () => {
    mockProductionApi()
    const { info } = await getGitInfo(true)
    expect(info).toEqual({
      gitCommitAbbrev: 'a9c3b03',
      gitCommit: 'a9c3b0201c3ffd4218e6277d99be2c74dbb0f865'
    })
  })
})
