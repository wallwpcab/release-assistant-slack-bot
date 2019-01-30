const tracer = require('tracer')
require('../../test-utils/mock-implementations')
const { requestPost } = require('./controller')
const { waitForInternalPromises, toggleLogger } = require('../../test-utils')
const { mockDialogOpenApi } = require('../../test-utils/mock-api')
const { requestFormView } = require('../request/views')

describe('Request controller', async () => {
  it('Can open request dialog', async () => {
    const req = {
      body: {
        trigger_id: 'test-trigger'
      }
    }

    const res = {
      send: jest.fn()
    }

    const api = mockDialogOpenApi(({ dialog }) => {
      expect(dialog).toBe(JSON.stringify(requestFormView()))
      return true
    })

    await requestPost(req, res)
    await waitForInternalPromises()

    expect(api.isDone()).toBe(true)
    expect(res.send).toBeCalled()
  })

  it('Can handle error', async () => {
    const req = {
      body: null
    }

    const res = {
      send: jest.fn(),
      sendStatus: jest.fn()
    }

    toggleLogger()
    await requestPost(req, res)
    await waitForInternalPromises()
    toggleLogger()

    expect(res.sendStatus).toBeCalledWith(500)
  })
})
