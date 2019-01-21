const { requestFormView } = require('./views')
const { openDialog } = require('../slack/integration')
const log = require('../../utils/log')

const requestPost = async (req, res) => {
  const { text, trigger_id } = req.body || {}

  try {
    await openDialog(trigger_id, requestFormView(text))
    res.send()
  } catch (err) {
    log.error('/slack/command/request > openDialog() failed', err)
    res.sendStatus(500)
  }
}

module.exports = {
  requestPost
}
