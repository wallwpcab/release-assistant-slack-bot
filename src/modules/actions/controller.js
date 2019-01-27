const { path } = require('ramda')

const log = require('../../utils/log')
const { handleIfEditDialogAction } = require('./config/actions')
const { handleIfRequestProgressAction } = require('./progress/actions')
const {
  handleIfRequestDialogAction,
  handleIfInitiateRequestAction,
  handleIfRejectRequestAction
} = require('./request/actions')

const actionsPost = async (req, res) => {
  try {
    const payload = JSON.parse(path(['body', 'payload'], req))
    handleIfDialog(payload)
    handleIfInteractiveMessage(payload)
  } catch (err) {
    log.error('actions > actionsPost() > sendMessage() failed', err)
  }

  res.send()
}

const handleIfDialog = (payload) => {
  if (payload.type !== 'dialog_submission') {
    return
  }
  handleIfRequestDialogAction(payload)
  handleIfEditDialogAction(payload)
}

const handleIfInteractiveMessage = (payload) => {
  if (payload.type !== 'interactive_message') {
    return
  }
  handleIfInitiateRequestAction(payload)
  handleIfRejectRequestAction(payload)
  handleIfRequestProgressAction(payload)
}

module.exports = {
  actionsPost
}
