const { setMockId } = require('../../../test-utils/mock-implementations')
const { format } = require('date-fns')

const { RequestType } = require('../../request/mappings')
const { getInitialRequests, createDeployment, getOrCreateDeployment, getGroupType, updateObject } = require('./utils')
const { mockConfig, mockInitialRequest, mockApprovedRequest, mockInitialBuild, mockInitialDeployment, mockBranchDeployment } = require('../../../test-utils/mock-data')
const { mockGitProductionApi } = require('../../../test-utils/mock-api')
const { updateConfig } = require('../../../bot-config')

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
      branch: `release/${format(new Date(), 'YY-MM-DD')}/${mockInitialRequest.type}/${id}`
    }

    const mockDeployment = {
      ...mockInitialDeployment,
      id,
      build: mockBuild
    }

    const deployment = await createDeployment([mockInitialRequest])

    expect(gitApi.isDone()).toBe(true)
    expect(deployment).toMatchObject({
      ...mockDeployment,
      requests: [mockInitialRequest.id]
    })
  })

  it('Should create a new deployment', async () => {
    const gitApi = mockGitProductionApi()
    const id = setMockId('id-32')

    const mockBuild = {
      ...mockInitialBuild,
      branch: `release/${format(new Date(), 'YY-MM-DD')}/${mockInitialRequest.type}/${id}`
    }

    const mockDeployment = {
      ...mockBranchDeployment,
      id,
      build: mockBuild,
    }

    const deployments = {
      [id]: mockDeployment
    }

    const deployment = await getOrCreateDeployment(deployments, [mockInitialRequest])

    expect(gitApi.isDone()).toBe(true)
    expect(deployment.requests).toHaveLength(1)
  })

  it('Should get an existing deployment', async () => {
    const gitApi = mockGitProductionApi()
    const id = setMockId('id-32')

    const mockBuild = {
      ...mockInitialBuild,
      branch: `release/${format(new Date(), 'YY-MM-DD')}/${mockInitialRequest.type}/${id}`
    }

    const mockDeployment = {
      ...mockInitialDeployment,
      id,
      build: mockBuild,
    }

    const deployments = {
      [id]: mockDeployment
    }

    const deployment = await getOrCreateDeployment(deployments, [mockInitialRequest])

    expect(gitApi.isDone()).toBe(true)
    expect(deployment.requests).toHaveLength(2)
  })

  it('Can get request group type', () => {
    const activationRequest = {
      ...mockInitialRequest,
      type: RequestType.activation.value
    }

    const hotfixRequest = {
      ...mockInitialRequest,
      type: RequestType.hotfix.value
    }

    const type1 = getGroupType([
      activationRequest,
      activationRequest
    ])
    expect(type1).toBe(RequestType.activation.value)

    const type2 = getGroupType([
      hotfixRequest,
      hotfixRequest
    ])
    expect(type2).toBe(RequestType.hotfix.value)

    const type3 = getGroupType([
      activationRequest,
      hotfixRequest
    ])
    expect(type3).toBe(`${RequestType.hotfix.value}-${RequestType.activation.value}`)
  })

  it('Can update child object', () => {
    const child = {
      id: '1',
      b: 'b'
    }
    const parent = {
      '1': {
        id: '1',
        a: 'a'
      }
    }

    expect(updateObject(parent, child, 'id')).toMatchObject({
      ...parent,
      [child.id]: child
    })
  })
})
