const { pathOr } = require('ramda')

const { getOrCreateDeployment, updateObject, getRequests } = require('./utils')
const { Request, RequestApproval, RequestStatus } = require('../../request/mappings')
const { readConfig, updateConfig } = require('../../../bot-config')
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

  const { botChannel, releaseManagers, requests } = await readConfig()
  const request = await createRequest(submission, user, botChannel)

  await Promise.all([
    updateConfig({ requests: updateObject(requests, request) }),
    sendMessageOverUrl(response_url, requestReceivedAuthorView(request)),
    sendMessageToUsers(releaseManagers, requestReceivedManagerView(request))
  ])
}

const handleIfInitiateRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {}
  if (callback_id !== RequestApproval.callback_id || name !== RequestApproval.approve) return

  let { releaseManagers, requests, deployments, botChannel } = await readConfig()
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
  const deploymentRequests = getRequests(deployment.requests, requests)

  request = {
    ...request,
    status: RequestStatus.approved,
    approver: user,
    deploymentId: deployment.id
  }
  requests = updateObject(requests, request)
  deployments = updateObject(deployments, deployment)

  await Promise.all([
    updateConfig({ requests, deployments }),
    sendMessageToUsers(releaseManagers, requestInitiatedManagerView(deployment, requests, user)),
    ...deploymentRequests.map(request => {
      const { file: { thread_ts } } = request
      return sendMessageToChannel(botChannel, requestInitiatedChannelView(request, user), thread_ts)
    })
  ])
}

const handleIfRejectRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {}
  if (callback_id !== RequestApproval.callback_id || name !== RequestApproval.reject) return

  const { releaseManagers, requests, botChannel } = await readConfig()
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
    sendMessageToUsers(releaseManagers, requestRejectedManagerView(request, user)),
    sendMessageToChannel(botChannel, requestRejectedChannelView(request, user), thread_ts)
  ])
}

module.exports = {
  handleIfRequestDialogAction,
  handleIfInitiateRequestAction,
  handleIfRejectRequestAction
}
