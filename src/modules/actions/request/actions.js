const { pathOr } = require('ramda')

const { getOrCreateDeployment, updateObject } = require('./utils')
const { Request, RequestApproval, RequestStatus } = require('../../request/mappings')
const { readConfig, updateConfig } = require('../../../bot-config')
const { getRequestData } = require('../../../transformer')
const {
  sendMessage,
  sendMessageToUsers,
  postMessage,
  uploadRequestData,
  postMessageToBotChannel,
  addCommentOnFile
} = require('../../slack/integration')
const {
  requestReceivedFileCommentView,
  requestReceivedAuthorView,
  requestReceivedManagerView,
  requestInitiatedManagerView,
  requestInitiatedChannelView,
  requestInitiatedCommentView,
  requestRejectedAuthorView,
  requestRejectedManagerView,
  requestRejectedCommentView
} = require('./views')
const {
  requestInvalidIdView,
  requestAlreadyInitiatedView,
} = require('../../request/views')

const handleIfRequestDialogAction = async ({ callback_id, response_url, submission, user }) => {
  if (callback_id !== Request.callback_id) return

  let request = getRequestData(submission, user)
  let { botChannel, releaseManagers, requests } = await readConfig()
  const file = await uploadRequestData(request, botChannel, requestReceivedFileCommentView(request))

  request = {
    ...request,
    file,
    status: RequestStatus.initial
  }

  requests = updateObject(requests, request)

  await Promise.all([
    updateConfig({ requests }),
    postMessage(response_url, requestReceivedAuthorView(request)),
    sendMessageToUsers(releaseManagers, requestReceivedManagerView(request))
  ])
}

const handleIfInitiateRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {}
  if (callback_id !== RequestApproval.callback_id || name !== RequestApproval.approve) return

  let { releaseManagers, requests, deployments } = await readConfig()
  let request = pathOr(null, [requestId], requests)
  if (!request) {
    await sendMessage(user.id, requestInvalidIdView(requestId), true)
    return
  }

  if (request.status !== RequestStatus.initial) {
    await sendMessage(user.id, requestAlreadyInitiatedView(request), true)
    return
  }

  const deployment = await getOrCreateDeployment(deployments, requests)

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
    postMessageToBotChannel(requestInitiatedChannelView(request, user)),
    addCommentOnFile(request.file.id, requestInitiatedCommentView(user))
  ])
}

const handleIfRejectRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {}
  if (callback_id !== RequestApproval.callback_id || name !== RequestApproval.reject) return

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
    sendMessage(request.user.id, requestRejectedAuthorView(request, user)),
    sendMessageToUsers(releaseManagers, requestRejectedManagerView(request, user)),
    addCommentOnFile(file.id, requestRejectedCommentView(user))
  ])
}

module.exports = {
  handleIfRequestDialogAction,
  handleIfInitiateRequestAction,
  handleIfRejectRequestAction
}
