const { pathOr } = require('ramda')

const { cancelRequestMappings } = require('./mappings')
const {
  requestCanceledAuthorView,
  requestCanceledManagerView,
  requestCanceledCommentView
} = require('./views')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../request/views')
const { readConfig, updateConfig } = require('../../bot-config')
const {
  sendMessage,
  sendMessageToUsers,
  addCommentOnFile
} = require('../slack/integration')

const handleIfCancelRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {}
  if (callback_id !== cancelRequestMappings.callback_id || name !== cancelRequestMappings.yes) return

  const config = await readConfig()
  const { releaseManagers, requests } = config
  const requestData = pathOr(null, [requestId], requests)
  if (!requestData) {
    await sendMessage(user.id, requestInvalidIdView(requestId), true)
    return
  }

  if (requestData.progress) {
    await sendMessage(user.id, requestAlreadyInitiatedView(requestData), true)
    return
  }

  const { file } = requestData
  delete requests[requestId]

  await Promise.all([
    updateConfig({ requests }, true),
    sendMessage(user.id, requestCanceledAuthorView(requestData)),
    sendMessageToUsers(releaseManagers, requestCanceledManagerView(requestData, user)),
    addCommentOnFile(file.id, requestCanceledCommentView(user))
  ])
}

module.exports = {
  handleIfCancelRequestAction
}
