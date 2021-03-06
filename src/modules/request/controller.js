const { requestFormView } = require('./views')
const { openDialog } = require('../slack/integration')
const log = require('../../utils/log')

const requestPost = async (req, res) => {
  try {
    const { trigger_id: triggerId } = req.body
    await openDialog(triggerId, requestFormView())
    res.send()
  } catch (err) {
    log.error('/slack/command/request > openDialog() failed', err)
    res.sendStatus(500)
  }
}

module.exports = {
  requestPost
}
