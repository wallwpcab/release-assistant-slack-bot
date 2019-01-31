require('../src/test-utils/mock-implementations')
const { toggleLogger } = require('./test-utils')
const { mockState, mockGitCommit } = require('./test-utils/mock-data')
const { mockServer, mockGitStagingApi, mockGitProductionApi } = require('./test-utils/mock-api')
const { getStagingInfo, getProductionInfo, getGitInfo } = require('./git-integration')
const { updateState } = require('./bot-state')

describe('Git Integration', () => {
  beforeAll(async () => {
    await updateState(mockState)
  })

  it('Can get git staging info', async () => {
    const api = mockGitStagingApi()
    const { info } = await getStagingInfo()

    expect(api.isDone()).toBe(true)
    expect(info).toEqual(mockGitCommit)
  })

  it('Can handle exception on get git staging info', async () => {
    const api = mockServer(mockState.stagingInfoUrl).get('')
      .reply(500, {
        message: 'Error'
      })

    toggleLogger()
    const result = await getStagingInfo()
    toggleLogger()

    expect(api.isDone()).toBe(true)
    expect(result).toEqual({})
  })

  it('Can get git production info', async () => {
    const api = mockGitProductionApi()
    const { info } = await getProductionInfo()

    expect(api.isDone()).toBe(true)
    expect(info).toEqual(mockGitCommit)
  })

  it('Can handle exception on get git production info', async () => {
    const api = mockServer(mockState.productionInfoUrl).get('')
      .reply(500, {
        message: 'Error'
      })

    const result = await getProductionInfo()

    expect(api.isDone()).toBe(true)
    expect(result).toEqual({})
  })

  it('Can get git staging info based on the flag', async () => {
    const api = mockGitStagingApi()
    const { info } = await getGitInfo()

    expect(api.isDone()).toBe(true)
    expect(info).toEqual(mockGitCommit)
  })

  it('Can get git production info based on the flag', async () => {
    const api = mockGitProductionApi()
    const { info } = await getGitInfo(true)

    expect(api.isDone()).toBe(true)
    expect(info).toEqual(mockGitCommit)
  })
})
