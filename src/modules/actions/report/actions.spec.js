require('../../../test-utils/mock-implementations')
const { mockConfig, mockReportFormData, mockUser } = require('../../../test-utils/mock-data')
const { mockMessageApi } = require('../../../test-utils/mock-api')
const { waitForInternalPromises } = require('../../../test-utils')
const { updateConfig } = require('../../../bot-config')
const { Report } = require('../../report/mappings')
const { handleIfReportOkAction } = require('./actions')
const { confirmedReportView } = require('./views')

const responseUrl = 'http://response.slack.com/message'

describe('Report actions', async () => {
  beforeEach(async ()=> {
    await updateConfig(mockConfig, true)
  })

  it('Can post a new report', async () => {
    /** mock api **/
    const messageApi = mockMessageApi(({ text }) => {
      expect(text).toBe(confirmedReportView(mockUser).text)
      return true
    })

    const payload = {
      callback_id: Report.callback_id,
      response_url: responseUrl,
      submission: mockReportFormData,
      user: mockUser
    }

    await handleIfReportOkAction(payload)
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })
})
