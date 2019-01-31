require('../../test-utils/mock-implementations')
const { reportPost } = require('./controller')
const { reportFormView } = require('./views')
const { waitForInternalPromises } = require('../../test-utils')
const { mockState } = require('../../test-utils/mock-data')
const { mockDialogOpenApi } = require('../../test-utils/mock-api')
const { updateState } = require('../../bot-state')

describe('Report controller', async () => {
  it('Can open report dialog', async () => {
    const req = {
      body: {
        trigger_id: 'test-trigger'
      }
    }

    const res = {
      send: jest.fn()
    }

    const config = mockState.config

    /* mock api */
    const api = mockDialogOpenApi(({ dialog }) => {
      expect(dialog).toBe(JSON.stringify(reportFormView(config.reportSections)))
      return true
    })

    await updateState(mockState, true)
    await reportPost(req, res)
    await waitForInternalPromises()

    expect(api.isDone()).toBe(true)
    expect(res.send).toBeCalled()
  })
})
