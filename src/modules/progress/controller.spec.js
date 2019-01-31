require('../../test-utils/mock-implementations')
const { progressPost } = require('./controller')
const { waitForInternalPromises } = require('../../test-utils')
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
    const req = {
      body: {
        text: ''
      }
    }

    const res = {
      send: jest.fn()
    }

    await progressPost(req, res)
    await waitForInternalPromises()

    const requestArray = Object.values(requests).map(v => v)
    expect(res.send).toBeCalledWith(showProgressView(requestArray))
  })

  it('Can handle view progress for a request', async () => {
    const req = {
      body: {
        text: `-i ${mockInitialRequest.id}`
      }
    }

    const res = {
      send: jest.fn()
    }

    await progressPost(req, res)
    await waitForInternalPromises()

    expect(res.send).toBeCalledWith(showProgressView([mockInitialRequest]))
  })

  it('Can handle cancel progress with invalid request id', async () => {
    const requestId = 'invalid-id'
    const req = {
      body: {
        text: `-i ${requestId}`
      }
    }

    const res = {
      send: jest.fn()
    }

    await progressPost(req, res)
    await waitForInternalPromises()

    expect(res.send).toBeCalledWith(requestInvalidIdView(requestId))
  })

  it('Can handle cancel progress for already initiated request', async () => {
    const req = {
      body: {
        text: `-i ${mockApprovedRequest.id} --cancel`
      }
    }



    const res = {
      send: jest.fn()
    }

    await progressPost(req, res)
    await waitForInternalPromises()

    expect(res.send).toBeCalledWith(requestAlreadyInitiatedView(mockApprovedRequest))
  })

  it('Can handle cancel progress', async () => {
    const req = {
      body: {
        text: `-i ${mockInitialRequest.id} --cancel`
      }
    }

    const res = {
      send: jest.fn()
    }

    await progressPost(req, res)
    await waitForInternalPromises()

    expect(res.send).toBeCalledWith(confirmRequestCancelView(mockInitialRequest))
  })
})
