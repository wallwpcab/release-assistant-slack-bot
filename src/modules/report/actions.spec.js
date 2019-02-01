const { setMockDate } = require('../../test-utils/mock-implementations')
const { mockState, mockReportFormData, mockConfirmedReport, mockUser, mockStagingBuild } = require('../../test-utils/mock-data')
const { mockMessageApi, mockPublicMessageApi } = require('../../test-utils/mock-api')
const { waitForInternalPromises } = require('../../test-utils')
const { readState, updateState } = require('../../bot-state')
const { Report } = require('./mappings')
const { handleIfReportAction } = require('./actions')
const { confirmedReportAuthorView, confirmedReportManagerView } = require('./action-views')
const { getSection, getPendingSections, createReport } = require('./utils')

const responseUrl = 'http://response.slack.com/message'

describe('Report actions', async () => {
  beforeEach(async () => {
    await updateState(mockState, true)
  })

  it('Can post a report', async () => {
    const config = mockState.config
    const section = getSection(mockReportFormData, config.reportSections)
    const pendingSections = getPendingSections(config.reportSections, mockState.dailyReport)
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

    await updateState({
      deployments: {
        staging: {
          build: mockStagingBuild
        }
      }
    })
    await handleIfReportAction(payload)
    await waitForInternalPromises()

    const { dailyReport } = await readState()

    // should call following api
    expect(publicMessageApi.isDone()).toBe(true)
    expect(messageApi.isDone()).toBe(true)

    // should have following update in state
    expect(dailyReport[mockReportFormData.section]).toMatchObject(mockConfirmedReport)
  })
})
