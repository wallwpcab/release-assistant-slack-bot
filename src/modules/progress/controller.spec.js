require('../../test-utils/mock-implementations')
const { progressPost } = require('./controller')
const { waitForInternalPromises, expressHelper } = require('../../test-utils')
const { updateState } = require('../../bot-state')
const { mockState, mockInitialRequest, mockApprovedRequest } = require('../../test-utils/mock-data')
const { showProgressView, confirmRequestCancelView } = require('./views')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../request/views')

const requests = {
  [mockInitialRequest.id]: mockInitialRequest,
  [mockApprovedRequest.id]: mockApprovedRequest
}

describe('Progress controller', async () => {
  beforeEach(async () => {
    await updateState({
      ...mockState,
      requests
    }, true)
  })

  it('Can handle view progress for all requests', async () => {
    const http = expressHelper({
      text: ''
    })

    await progressPost(...http.args)
    await waitForInternalPromises()

    const requestArray = Object.values(requests).map(v => v)
    expect(http.res.send).toBeCalledWith(showProgressView(requestArray))
  })

  it('Can handle view progress for a request', async () => {
    const http = expressHelper({
      text: `-i ${mockInitialRequest.id}`
    })

    await progressPost(...http.args)
    await waitForInternalPromises()

    expect(http.res.send).toBeCalledWith(showProgressView([mockInitialRequest]))
  })

  it('Can handle cancel progress with invalid request id', async () => {
    const requestId = 'invalid-id'
    const http = expressHelper({
      text: `-i ${requestId}`
    })

    await progressPost(...http.args)
    await waitForInternalPromises()

    expect(http.res.send).toBeCalledWith(requestInvalidIdView(requestId))
  })

  it('Can handle cancel progress for already initiated request', async () => {
    const http = expressHelper({
      text: `-i ${mockApprovedRequest.id} --cancel`
    })

    await progressPost(...http.args)
    await waitForInternalPromises()

    expect(http.res.send).toBeCalledWith(requestAlreadyInitiatedView(mockApprovedRequest))
  })

  it('Can handle cancel progress', async () => {
    const http = expressHelper({
      text: `-i ${mockInitialRequest.id} --cancel`
    })

    await progressPost(...http.args)
    await waitForInternalPromises()

    expect(http.res.send).toBeCalledWith(confirmRequestCancelView(mockInitialRequest))
  })
})
