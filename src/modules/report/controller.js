const minimist = require('minimist')

const { reportFormView } = require('./views')
const { openDialog } = require('../slack/integration')
const log = require('../../utils/log')
const { readState } = require('../../bot-state')

const reportPost = async (req, res) => {
  try {
    const { trigger_id } = req.body
    const { config } = await readState()
    const { reportSections } = config
    await openDialog(trigger_id, reportFormView(reportSections))
    res.send()
  } catch (err) {
    log.error('/slack/command/report > openDialog() failed', err)
    res.sendStatus(500)
  }
}

module.exports = {
  reportPost
}
