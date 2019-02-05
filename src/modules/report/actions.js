const {
  pathOr
} = require('ramda')

const {
  Report
} = require('./mappings')
const {
  readState,
  updateState
} = require('../../bot-state')
const {
  updateById
} = require('../../utils')
const {
  sendMessageOverUrl,
  sendMessageToUsers,
  sendMessageToChannel
} = require('../slack/integration')
const {
  confirmedReportAuthorView,
  confirmedReportManagerView,
  confirmedReportChannelView
} = require('./action-views')
const {
  getSection,
  getPendingSections,
  createReport
} = require('./utils')

const handleIfReportAction = async ({
  callback_id: callbackId,
  response_url: responseUrl,
  submission,
  user
}) => {
  if (callbackId !== Report.callback_id) return

  let {
    // eslint-disable-next-line prefer-const
    config,
    dailyReport,
    // eslint-disable-next-line prefer-const
    deployments
  } = await readState()
  const {
    releaseManagers,
    releaseChannel,
    reportSections
  } = config
  const section = getSection(submission, reportSections)
  const report = createReport(submission, user)

  dailyReport = updateById(dailyReport, report)

  const pendingSections = getPendingSections(reportSections, dailyReport)
  const build = pathOr({}, ['staging', 'build'], deployments)

  await Promise.all([
    updateState({
      dailyReport
    }),
    sendMessageOverUrl(responseUrl, confirmedReportAuthorView(section, report)),
    sendMessageToUsers(
      releaseManagers, confirmedReportManagerView(build, section, report, pendingSections, user)
    ),
    sendMessageToChannel(
      releaseChannel, confirmedReportChannelView(build, section, report, pendingSections, user)
    )
  ])
}

module.exports = {
  handleIfReportAction
}
