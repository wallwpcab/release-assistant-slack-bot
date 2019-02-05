const { pathOr } = require('ramda')

const { RequestProgress } = require('./mappings')
const { readState, updateState } = require('../../bot-state')
const { RequestStatus } = require('../request/mappings')
const {
  requestCanceledManagerView,
  requestCanceledChannelView
} = require('./action-views')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('../request/views')
const {
  sendEphemeralMessage,
  sendMessageToUsers,
  sendMessageToChannel
} = require('../slack/integration')

const handleIfRequestProgressAction = async ({
  callback_id: callbackId, actions: [action], user
}) => {
  const { name: requestId, value } = action || {}
  if (callbackId !== RequestProgress.callback_id || value !== RequestProgress.cancel) return

  const { requests, config } = await readState()
  const { releaseManagers, releaseChannel } = config
  const request = pathOr(null, [requestId], requests)
  if (!request) {
    await sendEphemeralMessage(user, requestInvalidIdView(requestId))
    return
  }

  if (request.status !== RequestStatus.initial) {
    await sendEphemeralMessage(user, requestAlreadyInitiatedView(request))
    return
  }

  const { file: { thread_ts: threadTs } } = request
  delete requests[requestId]

  await Promise.all([
    updateState({ requests }, true),
    sendMessageToUsers(releaseManagers, requestCanceledManagerView(request, user)),
    sendMessageToChannel(releaseChannel, requestCanceledChannelView(user), threadTs)
  ])
}

module.exports = {
  handleIfRequestProgressAction
}
