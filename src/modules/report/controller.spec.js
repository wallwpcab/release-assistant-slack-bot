require('../../test-utils/mock-implementations')
const { reportPost } = require('./controller')
const { reportFormView, reportStatusView } = require('./views')
const { waitForInternalPromises, expressHelper } = require('../../test-utils')
const { mockState } = require('../../test-utils/mock-data')
const { mockDialogOpenApi } = require('../../test-utils/mock-api')
const { updateState } = require('../../bot-state')

describe('Report controller', async () => {
  it('Can open report dialog', async () => {
    const http = expressHelper({
      trigger_id: 'test-trigger',
      text: ''
    })
    const config = mockState.config

    /* mock api */
    const api = mockDialogOpenApi(({ dialog }) => {
      expect(dialog).toBe(JSON.stringify(reportFormView(config.reportSections)))
      return true
    })
    /* mock api */

    await updateState(mockState, true)
    await reportPost(...http.args)
    await waitForInternalPromises()

    expect(api.isDone()).toBe(true)
    expect(http.res.send).toBeCalledWith()
  })

  it('Can send report status', async () => {
    const trigger_id = 'test-trigger'
    const http = expressHelper({
      trigger_id,
      text: '-s'
    })
    const config = mockState.config

    await updateState(mockState, true)
    await reportPost(...http.args)
    await waitForInternalPromises()

    expect(http.res.send).toBeCalledWith(reportStatusView(config.reportSections, mockState.dailyReport))
  })
})
