const { getInitialRequests } = require('./utils')
const { mockInitialRequest, mockApprovedRequest } = require('../../test-utils/mock-data')

describe('Request utils', ()=> {
  it('Can filter initial requests', () => {
    const requests = {
      [mockInitialRequest.id]: mockInitialRequest,
      [mockApprovedRequest.id]: mockApprovedRequest
    }

    expect(getInitialRequests(requests)).toEqual([mockInitialRequest])
  })
})
