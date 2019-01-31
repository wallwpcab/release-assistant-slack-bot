const { pathOr } = require('ramda')

const { Report } = require('../../report/mappings')
const { readState, updateState } = require('../../../bot-state')
const { updateById } = require('../../../utils')
const { sendMessageToUsers, sendMessageOverUrl } = require('../../slack/integration')
const { confirmedReportAuthorView, confirmedReportManagerView } = require('./views')
const { getSection, getPendingSections, createReport } = require('./utils')

const handleIfReportOkAction = async ({ callback_id, response_url, submission, user }) => {
  if (callback_id !== Report.callback_id) return

  let { releaseManagers, config, dailyReport, deployments } = await readState()
  const { reportSections } = config
  const section = getSection(submission, reportSections)
  const report = createReport(submission, user)

  dailyReport = updateById(dailyReport, report)

  const pendingSections = getPendingSections(reportSections, dailyReport)
  const build = pathOr({}, ['staging', 'build'], deployments)

  await Promise.all([
    updateState({ dailyReport }),
    sendMessageOverUrl(response_url, confirmedReportAuthorView(section, report)),
    sendMessageToUsers(releaseManagers, confirmedReportManagerView(build, section, report, pendingSections, user))
  ])
}

module.exports = {
  handleIfReportOkAction
}
