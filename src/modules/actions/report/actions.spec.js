const { setMockDate } = require('../../../test-utils/mock-implementations')
const { mockConfig, mockReportFormData, mockConfirmedReport, mockUser, mockStagingBuild } = require('../../../test-utils/mock-data')
const { mockMessageApi, mockPublicMessageApi } = require('../../../test-utils/mock-api')
const { waitForInternalPromises } = require('../../../test-utils')
const { readConfig, updateConfig } = require('../../../bot-config')
const { Report } = require('../../report/mappings')
const { handleIfReportOkAction } = require('./actions')
const { confirmedReportAuthorView, confirmedReportManagerView } = require('./views')
const { getSection, getPendingSections, createReport } = require('./utils')

const responseUrl = 'http://response.slack.com/message'

describe('Report actions', async () => {
  beforeEach(async () => {
    await updateConfig(mockConfig, true)
  })

  it('Can post a report', async () => {
    const config = mockConfig.config
    const section = getSection(mockReportFormData, config.reportSections)
    const pendingSections = getPendingSections(config.reportSections, mockConfig.dailyReport)
      .filter(s => s.id !== section.id)
    const report = createReport(mockReportFormData, mockUser)

    /** mock api **/
    const publicMessageApi = mockPublicMessageApi(responseUrl, ({ text }) => {
      expect(text).toBe(confirmedReportAuthorView(section, report).text)
      return true
    })

    const messageApi = mockMessageApi(({ text }) => {
      expect(text).toBe(confirmedReportManagerView(mockStagingBuild, section, report, pendingSections, mockUser).text)
      return true
    })

    setMockDate('2019-01-27T18:13:15.249Z')

    const payload = {
      callback_id: Report.callback_id,
      response_url: responseUrl,
      submission: mockReportFormData,
      user: mockUser
    }

    await updateConfig({
      deployments: {
        staging: {
          build: mockStagingBuild
        }
      }
    })
    await handleIfReportOkAction(payload)
    await waitForInternalPromises()

    const { dailyReport } = await readConfig()

    // should call following api
    expect(publicMessageApi.isDone()).toBe(true)
    expect(messageApi.isDone()).toBe(true)

    // should have following update in state
    expect(dailyReport[mockReportFormData.section]).toMatchObject(mockConfirmedReport)
  })
})
