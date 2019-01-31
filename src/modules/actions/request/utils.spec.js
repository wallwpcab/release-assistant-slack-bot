const { setMockId, setMockDate } = require('../../../test-utils/mock-implementations')
const { createDeployment, getOrCreateDeployment } = require('./utils')
const { mockState, mockInitialRequest, mockInitialDeployment, mockBranchDeployment } = require('../../../test-utils/mock-data')
const { mockGitProductionApi } = require('../../../test-utils/mock-api')
const { updateState } = require('../../../bot-state')

describe('Request actions utils', async () => {
  beforeEach(async () => {
    await updateState(mockState)
  })

  it('Can create an initial deployment', async () => {
    const gitApi = mockGitProductionApi()
    const id = setMockId('dep-1')
    setMockDate(new Date('2018-10-14').toISOString())

    const mockDeployment = {
      ...mockInitialDeployment,
      id
    }
    const deployment = await createDeployment([mockInitialRequest])

    expect(gitApi.isDone()).toBe(true)
    expect(deployment).toMatchObject({
      ...mockDeployment,
      requests: [mockInitialRequest]
    })
  })

  it('Should create a new deployment', async () => {
    const gitApi = mockGitProductionApi()
    const id = setMockId('dep-1')
    setMockDate(new Date('2018-10-14').toISOString())

    const mockDeployment = {
      ...mockBranchDeployment,
      id
    }

    const requests = {
      [mockInitialRequest.id]: mockInitialRequest
    }

    const deployments = {
      [id]: mockDeployment
    }

    const deployment = await getOrCreateDeployment(deployments, requests)

    expect(gitApi.isDone()).toBe(true)
    expect(deployment.requests).toHaveLength(1)
  })

  it('Should get an existing deployment', async () => {
    const gitApi = mockGitProductionApi()
    const id = setMockId('id-32')
    setMockDate(new Date('2018-10-14').toISOString())

    const requests = {
      [mockInitialRequest.id]: mockInitialRequest
    }

    const deployments = {
      [id]: mockInitialDeployment
    }

    const deployment = await getOrCreateDeployment(deployments, requests)

    expect(gitApi.isDone()).toBe(true)
    expect(deployment.requests).toHaveLength(2)
  })
})
