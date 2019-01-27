const { pathOr } = require('ramda')

const { getInitialRequests } = require('./utils')
const { Request, RequestApproval, RequestType, RequestStatus } = require('./mappings')
const { readConfig, updateConfig } = require('../../bot-config')
const { getGitInfo } = require('../../git-integration')
const { getRequestData } = require('../../transformer')
const {
  sendMessage,
  sendMessageToUsers,
  postMessage,
  uploadRequestData,
  postMessageToBotChannel,
  addCommentOnFile
} = require('../slack/integration')
const {
  requestReceivedAuthorView,
  requestReceivedManagerView,
  requestInvalidIdView,
  requestAlreadyInitiatedView,
  requestInitiatedAuthorView,
  requestInitiatedManagerView,
  requestInitiatedChannelView,
  requestInitiatedCommentView,
  requestRejectedAuthorView,
  requestRejectedManagerView,
  requestRejectedCommentView
} = require('./views')

const handleIfRequestDialogAction = async ({ callback_id, response_url, submission, user }) => {
  if (callback_id !== Request.callback_id) return

  const requestData = getRequestData(submission, user)
  const [
    { id: fileId, permalink: fileLink },
    { releaseManagers }
  ] = await Promise.all([
    uploadRequestData(requestData),
    readConfig()
  ])

  const request = {
    ...requestData,
    status: RequestStatus.initial,
    file: {
      id: fileId,
      link: fileLink
    }
  }

  await Promise.all([
    updateConfig({
      requests: {
        [request.id]: request
      }
    }),
    postMessage(response_url, requestReceivedAuthorView(request)),
    sendMessageToUsers(releaseManagers, requestReceivedManagerView(request))
  ])
}

const handleIfInitiateRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {}
  if (callback_id !== RequestApproval.callback_id || name !== RequestApproval.approve) return

  const { releaseManagers, requests } = await readConfig()
  const request = pathOr(null, [requestId], requests)
  if (!request) {
    await sendMessage(user.id, requestInvalidIdView(requestId), true)
    return
  }

  if (request.status !== RequestStatus.initial) {
    await sendMessage(user.id, requestAlreadyInitiatedView(request), true)
    return
  }

  const { type, file } = request
  const { info } = await getGitInfo(type === RequestType.hotfix.value)

  const targetRequest = {
    ...request,
    status: RequestStatus.approved,
    baseCommit: info.gitCommitAbbrev,
    approver: user
  }

  const allRequests = {
    ...requests,
    [requestId]: targetRequest
  }

  const initialRequests = getInitialRequests(allRequests)

  await Promise.all([
    updateConfig({ requests: allRequests }),
    sendMessage(targetRequest.user.id, requestInitiatedAuthorView(targetRequest, user)),
    sendMessageToUsers(releaseManagers, requestInitiatedManagerView(targetRequest, initialRequests, user)),
    postMessageToBotChannel(requestInitiatedChannelView(targetRequest, user)),
    addCommentOnFile(file.id, requestInitiatedCommentView(user))
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
