const { pathOr } = require('ramda')

const { updateById } = require('../../../utils')
const { getOrCreateDeployment } = require('./utils')
const { Request, RequestApproval, RequestStatus } = require('../../request/mappings')
const { readState, updateState } = require('../../../bot-state')
const { getRequestData } = require('../../../transformer')
const {
  sendEphemeralMessage,
  sendMessageToUsers,
  sendMessageToChannel,
  sendMessageOverUrl,
  uploadRequestData,
  getPermalink
} = require('../../slack/integration')
const {
  requestReceivedAuthorView,
  requestReceivedManagerView,
  requestReceivedChannelView,
  requestInitiatedManagerView,
  requestInitiatedChannelView,
  requestRejectedManagerView,
  requestRejectedChannelView
} = require('./views')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView,
} = require('../../request/views')

const createRequest = async (submissionData, user, botChannel) => {
  const requestData = getRequestData(submissionData, user)
  const file = await uploadRequestData(requestData, botChannel.id, requestReceivedChannelView(requestData))
  const permalink = await getPermalink(botChannel.id, file.thread_ts)
  const request = {
    ...requestData,
    permalink,
    file,
    status: RequestStatus.initial
  }
  return request
}

const handleIfRequestDialogAction = async ({ callback_id, response_url, submission, user }) => {
  if (callback_id !== Request.callback_id) return

  const { botChannel, releaseManagers, requests } = await readState()
  const request = await createRequest(submission, user, botChannel)

  await Promise.all([
    updateState({ requests: updateById(requests, request) }),
    sendMessageOverUrl(response_url, requestReceivedAuthorView(request)),
    sendMessageToUsers(releaseManagers, requestReceivedManagerView(request))
  ])
}

const handleIfInitiateRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name: requestId, value } = action || {}
  if (callback_id !== RequestApproval.callback_id || value !== RequestApproval.approve) return

  let { releaseManagers, requests, deployments, botChannel } = await readState()
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

const handleIfRejectRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name: requestId, value } = action || {}
  if (callback_id !== RequestApproval.callback_id || value !== RequestApproval.reject) return

  const { releaseManagers, requests, botChannel } = await readState()
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
    updateState({ requests }, true),
    sendMessageToUsers(releaseManagers, requestRejectedManagerView(request, user)),
    sendMessageToChannel(botChannel, requestRejectedChannelView(request, user), thread_ts)
  ])
}

module.exports = {
  handleIfRequestDialogAction,
  handleIfInitiateRequestAction,
  handleIfRejectRequestAction
}
