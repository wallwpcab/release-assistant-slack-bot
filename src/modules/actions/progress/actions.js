const { pathOr } = require('ramda')

const { RequestProgress } = require('../../progress/mappings')
const { readConfig, updateConfig } = require('../../../bot-config')
const { RequestStatus } = require('../../request/mappings')
const {
  requestCanceledManagerView,
  requestCanceledChannelView
} = require('./views')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../../request/views')
const {
  sendEphemeralMessage,
  sendMessageToUsers,
  sendMessageToChannel
} = require('../../slack/integration')

const handleIfRequestProgressAction = async ({ callback_id, actions: [action], user }) => {
  const { name: requestId, value } = action || {}
  if (callback_id !== RequestProgress.callback_id || value !== RequestProgress.cancel) return

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

  const { file: { thread_ts } } = request
  delete requests[requestId]

  await Promise.all([
    updateConfig({ requests }, true),
    sendMessageToUsers(releaseManagers, requestCanceledManagerView(request, user)),
    sendMessageToChannel(botChannel, requestCanceledChannelView(user), thread_ts)
  ])
}

module.exports = {
  handleIfRequestProgressAction
}
