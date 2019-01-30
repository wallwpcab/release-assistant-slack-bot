const { Report } = require('../../report/mappings')
const { readConfig } = require('../../../bot-config')
const { sendMessageToUsers } = require('../../slack/integration')
const { confirmedReportView } = require('./views')

const handleIfReportOkAction = async ({ callback_id, response_url, submission, user }) => {
  if (callback_id !== Report.callback_id) return

  const { releaseManagers } = await readConfig()
  await sendMessageToUsers(releaseManagers, confirmedReportView(user))
}

module.exports = {
  handleIfReportOkAction
}
