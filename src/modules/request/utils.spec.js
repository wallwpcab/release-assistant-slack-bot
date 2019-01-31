require('../../test-utils/mock-implementations')
const { RequestType } = require('./mappings')
const { getInitialRequests, getGroupType } = require('./utils')
const { updateState } = require('../../bot-state')
const { mockState, mockInitialRequest, mockApprovedRequest } = require('../../test-utils/mock-data')

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
})
