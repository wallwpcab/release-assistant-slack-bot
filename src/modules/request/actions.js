const { pathOr } = require('ramda')

const { updateById } = require('../../utils')
const { getOrCreateDeployment } = require('./utils')
const { Request, RequestApproval, RequestStatus } = require('./mappings')
const { readState, updateState } = require('../../bot-state')
const { getRequestData } = require('../../transformer')
const {
  sendEphemeralMessage,
  sendMessageToUsers,
  sendMessageToChannel,
  sendMessageOverUrl,
  uploadRequestData,
  getPermalink
} = require('../slack/integration')
const {
  requestReceivedAuthorView,
  requestReceivedManagerView,
  requestReceivedChannelView,
  requestInitiatedManagerView,
  requestInitiatedChannelView,
  requestRejectedManagerView,
  requestRejectedChannelView
} = require('./action-views')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView
} = require('./views')

const createRequest = async (submissionData, user, botChannel) => {
  const requestData = getRequestData(submissionData, user)
  const file = await uploadRequestData(
    requestData, botChannel.id, requestReceivedChannelView(requestData)
  )
  const permalink = await getPermalink(botChannel.id, file.thread_ts)
  const request = {
    ...requestData,
    permalink,
    file,
    status: RequestStatus.initial
  }
  return request
}

const handleIfRequestDialogAction = async ({
  callback_id: callbackId, response_url: responseUrl, submission, user
}) => {
  if (callbackId !== Request.callback_id) return

  const { config, requests } = await readState()
  const { releaseManagers, botChannel } = config
  const request = await createRequest(submission, user, botChannel)

  await Promise.all([
    updateState({ requests: updateById(requests, request) }),
    sendMessageOverUrl(responseUrl, requestReceivedAuthorView(request)),
    sendMessageToUsers(releaseManagers, requestReceivedManagerView(request))
  ])
}

const handleIfInitiateRequestAction = async ({
  callback_id: callbackId, actions: [action], user
}) => {
  const { name: requestId, value } = action || {}
  if (callbackId !== RequestApproval.callback_id || value !== RequestApproval.approve) return

  // eslint-disable-next-line prefer-const
  let { config, requests, deployments } = await readState()
  const { releaseManagers, botChannel } = config
  // eslint-disable-next-line prefer-const
  let request = pathOr(null, [requestId], requests)
  if (!request) {
    await sendEphemeralMessage(user, requestInvalidIdView(requestId))
    return
  }

  if (request.status !== RequestStatus.initial) {
    await sendEphemeralMessage(user, requestAlreadyInitiatedView(request))
    return
  }

  const deployment = await getOrCreateDeployment(deployments, requests)
  deployments = updateById(deployments, deployment.export())
  requests = updateById(requests, {
    ...request,
    status: RequestStatus.approved,
    approver: user,
    deploymentId: deployment.id
  })

  await Promise.all([
    updateState({ requests, deployments }),
    sendMessageToUsers(releaseManagers, requestInitiatedManagerView(deployment, user)),
    sendMessageToChannel(
      botChannel,
      requestInitiatedChannelView(deployment, user),
      deployment.getRequestThread()
    )
  ])
}

const handleIfRejectRequestAction = async ({
  callback_id: callbackId, actions: [action], user
}) => {
  const { name: requestId, value } = action || {}
  if (callbackId !== RequestApproval.callback_id || value !== RequestApproval.reject) return

  const { requests, config } = await readState()
  const { releaseManagers, botChannel } = config
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
    sendMessageToUsers(releaseManagers, requestRejectedManagerView(request, user)),
    sendMessageToChannel(botChannel, requestRejectedChannelView(request, user), threadTs)
  ])
}

module.exports = {
  handleIfRequestDialogAction,
  handleIfInitiateRequestAction,
  handleIfRejectRequestAction
}
