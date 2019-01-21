require('../../test-utils/mock-implementations')
const { progressPost } = require('./controller')
const { waitForInternalPromises } = require('../../test-utils')
const { readConfig, updateConfig } = require('../../bot-config')
const { mockPostMessageApi } = require('../../test-utils/mock-api')
const { mockConfig, mockRequest, mockRequestInitiated } = require('../../test-utils/mock-data')
const { showProgressView, confirmRequestCancelView } = require('./views')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../request/views')

const requests = {
  [mockRequest.id]: mockRequest,
  [mockRequestInitiated.id]: mockRequestInitiated
}

describe('Progress controller', async () => {
  beforeEach(async () => {
    await updateConfig({
      ...mockConfig,
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
        text: `--id ${mockRequest.id}`
      }
    }

    const res = {
      send: jest.fn()
    }

    await progressPost(req, res)
    await waitForInternalPromises()

    expect(res.send).toBeCalledWith(showProgressView([mockRequest]))
  })

  it('can handle cancel progress with invalid request id', async () => {
    const requestId = 'invalid-id'
    const req = {
      body: {
        text: `--id ${requestId}`
      }
    }

    const res = {
      send: jest.fn()
    }

    await progressPost(req, res)
    await waitForInternalPromises()

    expect(res.send).toBeCalledWith(requestInvalidIdView(requestId))
  })

  it('can handle cancel progress for already initiated request', async () => {
    const req = {
      body: {
        text: `--id ${mockRequestInitiated.id} --cancel`
      }
    }

    const res = {
      send: jest.fn()
    }

    await progressPost(req, res)
    await waitForInternalPromises()

    expect(res.send).toBeCalledWith(requestAlreadyInitiatedView(mockRequestInitiated))
  })

  it('can handle cancel progress', async () => {
    const req = {
      body: {
        text: `--id ${mockRequest.id} --cancel`
      }
    }

    const res = {
      send: jest.fn()
    }

    await progressPost(req, res)
    await waitForInternalPromises()

    expect(res.send).toBeCalledWith(confirmRequestCancelView(mockRequest))
  })
})
