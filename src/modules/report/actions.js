const { pathOr } = require('ramda')

const { Report } = require('./mappings')
const { readState, updateState } = require('../../bot-state')
const { updateById } = require('../../utils')
const { sendMessageToUsers, sendMessageOverUrl } = require('../slack/integration')
const { confirmedReportAuthorView, confirmedReportManagerView } = require('./action-views')
const { getSection, getPendingSections, createReport } = require('./utils')

const handleIfReportAction = async ({ callback_id, response_url, submission, user }) => {
  if (callback_id !== Report.callback_id) return

  let { config, dailyReport, deployments } = await readState()
  const { releaseManagers, reportSections } = config
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
  handleIfReportAction
}