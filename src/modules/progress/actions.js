const { pathOr } = require('ramda')

const { CancelRequest } = require('./mappings')
const { readConfig, updateConfig } = require('../../bot-config')
const { RequestStatus } = require('../request/mappings')
const {
  requestCanceledAuthorView,
  requestCanceledManagerView,
  requestCanceledCommentView
} = require('./views')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../request/views')
const {
  sendMessage,
  sendMessageToUsers,
  addCommentOnFile
} = require('../slack/integration')

const handleIfCancelRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {}
  if (callback_id !== CancelRequest.callback_id || name !== CancelRequest.yes) return

  const config = await readConfig()
  const { releaseManagers, requests } = config
  const request = pathOr(null, [requestId], requests)
  if (!request) {
    await sendMessage(user.id, requestInvalidIdView(requestId), true)
    return
  }

  if (request.status !== RequestStatus.initial) {
    await sendMessage(user.id, requestAlreadyInitiatedView(request), true)
    return
  }

  const { file } = request
  delete requests[requestId]

  await Promise.all([
    updateConfig({ requests }, true),
    sendMessage(user.id, requestCanceledAuthorView(request)),
    sendMessageToUsers(releaseManagers, requestCanceledManagerView(request, user)),
    addCommentOnFile(file.id, requestCanceledCommentView(user))
  ])
}

module.exports = {
  handleIfCancelRequestAction
}
