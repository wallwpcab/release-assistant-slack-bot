const request = require('supertest')

require('./test-utils/mock-implementations')
const app = require('./app')
const { mockState } = require('./test-utils/mock-data')
const { mockDialogOpenApi } = require('./test-utils/mock-api')
const { updateState } = require('./bot-state')
const { reportFormView } = require('./modules/report/views')

describe('App tests', async () => {
  it('Can post to /slack/command/report', async () => {
    const { config } = mockState
    const api = mockDialogOpenApi(({ dialog }) => {
      expect(dialog).toBe(JSON.stringify(reportFormView(config.reportSections)))
      return true
    })

    await updateState(mockState, true)

    await request(app)
      .post('/slack/command/report')
      .send({})
      .set('Accept', 'application/json')
      .expect(200)

    expect(api.isDone()).toBe(true)
  })
})
