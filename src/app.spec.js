const request = require('supertest')

require('./test-utils/mock-implementations')
const app = require('./app')
const { mockConfig } = require('./test-utils/mock-data')
const { mockDialogOpenApi } = require('./test-utils/mock-api')
const { updateConfig } = require('./bot-config')
const { reportFormView } = require('./modules/report/views')

describe('App tests', async () => {
  it('Can post to /slack/command/report', async () => {
    const api = mockDialogOpenApi(({ dialog }) => {
      expect(dialog).toBe(JSON.stringify(reportFormView(mockConfig.reportSections)))
      return true
    })

    await updateConfig(mockConfig, true)

    await request(app)
      .post('/slack/command/report')
      .send({})
      .set('Accept', 'application/json')
      .expect(200)

    expect(api.isDone()).toBe(true)
  })
})
