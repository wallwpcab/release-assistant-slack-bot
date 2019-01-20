const { pathOr } = require('ramda')

const { handleIfEditDialogAction } = require('../config/actions')
const { handleIfCancelRequestAction } = require('../progress/actions')
const {
  handleIfRequestDialogAction,
  handleIfInitiateRequestAction,
  handleIfRejectRequestAction
} = require('../request/actions')
const log = require('../../utils/log')

const postActions = async (req, res) => {
  const payload = JSON.parse(pathOr('{}', ['body', 'payload'], req))
  const { type } = payload

  if (type === 'dialog_submission') {
    try {
      handleIfRequestDialogAction(payload)
      handleIfEditDialogAction(payload)
    } catch (err) {
      log.error('actions > postActions() > sendMessage() failed', err)
    }
  } if (type === 'interactive_message') {
    handleIfInitiateRequestAction(payload)
    // handleIfRejectRequestAction(payload)
    // handleIfCancelRequestAction(payload)
  }

  res.send()
}

module.exports = {
  postActions
}
