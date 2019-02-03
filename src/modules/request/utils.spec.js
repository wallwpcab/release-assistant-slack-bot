const { setMockId, setMockDate } = require('../../test-utils/mock-implementations')
const { RequestType } = require('./mappings')
const { getInitialRequests, getGroupType } = require('./utils')
const { updateState } = require('../../bot-state')
const { createDeployment, getOrCreateDeployment } = require('./utils')
const { mockGitProductionApi } = require('../../test-utils/mock-api')
const {
  mockState,
  mockInitialRequest,
  mockApprovedRequest,
  mockInitialDeployment,
  mockBranchDeployment
} = require('../../test-utils/mock-data')

describe('Request utils', async () => {
  beforeEach(async () => {
    await updateState(mockState)
  })

  it('Can filter initial requests', () => {
    const requests = {
      [mockInitialRequest.id]: mockInitialRequest,
      [mockApprovedRequest.id]: mockApprovedRequest
    }

    expect(getInitialRequests(requests)).toEqual([mockInitialRequest])
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

  it('Can create an initial deployment', async () => {
    const gitApi = mockGitProductionApi()
    const id = 'dep-1'
    setMockId(id)
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
    const id = 'dep-1'
    setMockId(id)
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
    const id = 'id-32'
    setMockId(id)
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
