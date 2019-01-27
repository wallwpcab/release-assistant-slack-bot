const { setMockId } = require('../../test-utils/mock-implementations')
const { format } = require('date-fns')
const { getInitialRequests, createDeployment, getOrCreateDeployment } = require('./request-utils')
const { mockConfig, mockInitialRequest, mockApprovedRequest, mockInitialBuild, mockInitialDeployment, mockBranchDeployment } = require('../../test-utils/mock-data')
const { mockGitProductionApi } = require('../../test-utils/mock-api')
const { updateConfig } = require('../../bot-config')

describe('Request utils', async () => {
  beforeEach(async () => {
    await updateConfig(mockConfig)
  })

  it('Can filter initial requests', () => {
    const requests = {
      [mockInitialRequest.id]: mockInitialRequest,
      [mockApprovedRequest.id]: mockApprovedRequest
    }

    expect(getInitialRequests(requests)).toEqual([mockInitialRequest])
  })

  it('Can create an initial deployment', async () => {
    const gitApi = mockGitProductionApi()
    const id = setMockId('id-32')

    const mockBuild = {
      ...mockInitialBuild,
      branch: `release/${format(new Date(), 'YY-MM-DD')}/${mockApprovedRequest.type}/${id}`
    }

    const mockDeployment = {
      ...mockInitialDeployment,
      id,
      build: mockBuild,
      requests: []
    }

    const deployment = await createDeployment(mockApprovedRequest.type)

    expect(gitApi.isDone()).toBe(true)
    expect(deployment).toMatchObject(mockDeployment)
  })

  it('Should create a new deployment', async () => {
    const gitApi = mockGitProductionApi()
    const id = setMockId('id-32')

    const mockBuild = {
      ...mockInitialBuild,
      branch: `release/${format(new Date(), 'YY-MM-DD')}/${mockApprovedRequest.type}/${id}`
    }

    const mockDeployment = {
      ...mockBranchDeployment,
      id,
      build: mockBuild,
    }

    const deployments = {
      [id]: mockDeployment
    }

    const deployment = await getOrCreateDeployment(deployments, mockApprovedRequest)

    expect(gitApi.isDone()).toBe(true)
    expect(deployment.requests).toHaveLength(0)
  })

  it('Should get an existing deployment', async () => {
    const gitApi = mockGitProductionApi()
    const id = setMockId('id-32')

    const mockBuild = {
      ...mockInitialBuild,
      branch: `release/${format(new Date(), 'YY-MM-DD')}/${mockApprovedRequest.type}/${id}`
    }

    const mockDeployment = {
      ...mockInitialDeployment,
      id,
      build: mockBuild,
    }

    const deployments = {
      [id]: mockDeployment
    }

    const deployment = await getOrCreateDeployment(deployments, mockApprovedRequest)

    expect(gitApi.isDone()).toBe(true)
    expect(deployment.requests).toHaveLength(1)
  })
})
