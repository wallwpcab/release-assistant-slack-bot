const { pathOr } = require('ramda')

const { RequestProgress } = require('../../progress/mappings')
const { readConfig, updateConfig } = require('../../../bot-config')
const { RequestStatus } = require('../../request/mappings')
const {
  requestCanceledAuthorView,
  requestCanceledManagerView,
  requestCanceledCommentView
} = require('./views')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../../request/views')
const {
  sendEphemeralMessage,
  sendMessageToUsers,
  sendMessageToChannel,
  addCommentOnFile
} = require('../../slack/integration')

const handleIfRequestProgressAction = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {}
  if (callback_id !== RequestProgress.callback_id || name !== RequestProgress.cancel) return

  const config = await readConfig()
  const { releaseManagers, requests, botChannel } = config
  const request = pathOr(null, [requestId], requests)
  if (!request) {
    await sendEphemeralMessage(user, requestInvalidIdView(requestId))
    return
  }

  if (request.status !== RequestStatus.initial) {
    await sendEphemeralMessage(user, requestAlreadyInitiatedView(request))
    return
  }

  const { file } = request
  delete requests[requestId]

  await Promise.all([
    updateConfig({ requests }, true),
    sendMessageToChannel(botChannel.id, requestCanceledAuthorView(request)),
    sendMessageToUsers(releaseManagers, requestCanceledManagerView(request, user)),
    addCommentOnFile(file.id, requestCanceledCommentView(user))
  ])
}

module.exports = {
  handleIfRequestProgressAction
}
