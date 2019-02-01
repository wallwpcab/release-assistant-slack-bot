const parseArgs = require('minimist')

const log = require('../../utils/log')
const { reportFormView, reportStatusView } = require('./views')
const { openDialog } = require('../slack/integration')
const { splitValues, argsChecker } = require('../../utils')
const { readState } = require('../../bot-state')

const reportPost = async (req, res) => {
  try {
    const { text = '', trigger_id = '' } = req.body
    const args = argsChecker(parseArgs(splitValues(text)))

    if (args.hasAny('status', 's'))
      return showReportStatus(res)

    if (args.isEmpty())
      return showReportDialog(trigger_id, res)

    res.send('Unknown arguments')
  } catch (err) {
    log.error('reportPost() > failed', err)
    res.sendStatus(500)
  }
}

const showReportDialog = async (trigger_id, res) => {
  const { config } = await readState()
  const { reportSections } = config
  await openDialog(trigger_id, reportFormView(reportSections))
  res.send()
}

const showReportStatus = async (res) => {
  const { config, dailyReport } = await readState()
  const { reportSections } = config
  res.send(reportStatusView(reportSections, dailyReport))
}

module.exports = {
  reportPost
}
