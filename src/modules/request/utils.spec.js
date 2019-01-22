const { getUnprocessedRequests } = require('./utils')
const { mockRequest, mockApprovedRequest } = require('../../test-utils/mock-data')

describe('Request utils', ()=> {
  it('Can filter initial requests', () => {
    const requests = {
      [mockRequest.id]: mockRequest,
      [mockApprovedRequest.id]: mockApprovedRequest
    }

    expect(getUnprocessedRequests(requests)).toEqual([mockRequest])
  })
})
