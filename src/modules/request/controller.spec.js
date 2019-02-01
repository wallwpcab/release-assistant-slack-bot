const tracer = require('tracer')
require('../../test-utils/mock-implementations')
const { requestPost } = require('./controller')
const { waitForInternalPromises, toggleLogger, expressHelper } = require('../../test-utils')
const { mockDialogOpenApi } = require('../../test-utils/mock-api')
const { requestFormView } = require('../request/views')

describe('Request controller', async () => {
  it('Can open request dialog', async () => {
    const http = expressHelper({
      trigger_id: 'test-trigger'
    })

    const api = mockDialogOpenApi(({ dialog }) => {
      expect(dialog).toBe(JSON.stringify(requestFormView()))
      return true
    })

    await requestPost(...http.args)
    await waitForInternalPromises()

    expect(api.isDone()).toBe(true)
    expect(http.res.send).toBeCalled()
  })

  it('Can handle error', async () => {
    const http = expressHelper(null)

    toggleLogger()
    await requestPost(...http.args)
    await waitForInternalPromises()
    toggleLogger()

    expect(http.res.sendStatus).toBeCalledWith(500)
  })
})
