const { pathOr } = require('ramda')

const { requestMapping, approvalMapping, requestTypes } = require('./mappings')
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
  if (callback_id !== requestMapping.callback_id) return

  const requestData = getRequestData(submission, user)
  const [
    { id: fileId, permalink: fileLink },
    { releaseManagers }
  ] = await Promise.all([
    uploadRequestData(requestData),
    readConfig()
  ])

  requestData.file = {
    id: fileId,
    link: fileLink
  }

  await Promise.all([
    updateConfig({
      requests: {
        [requestData.id]: requestData
      }
    }),
    postMessage(response_url, requestReceivedAuthorView(requestData)),
    sendMessageToUsers(releaseManagers, requestReceivedManagerView(requestData))
  ])
}

const handleIfInitiateRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {}
  if (callback_id !== approvalMapping.callback_id || name !== approvalMapping.initiate) return

  const { releaseManagers, requests } = await readConfig()
  const requestData = pathOr(null, [requestId], requests)
  if (!requestData) {
    await sendMessage(user.id, requestInvalidIdView(requestId), true)
    return
  }

  if (requestData.progress) {
    await sendMessage(user.id, requestAlreadyInitiatedView(requestData), true)
    return
  }

  const { type, file } = requestData
  const { info } = await getGitInfo(type === requestTypes.hotfix.value)

  const updatedRequest = {
    ...requestData,
    progress: approvalMapping.initiate,
    baseCommit: info.gitCommitAbbrev,
    initiator: user
  }

  const updatedRequests = {
    [requestId]: updatedRequest
  }

  await Promise.all([
    updateConfig({ requests: updatedRequests }),
    sendMessage(updatedRequest.user.id, requestInitiatedAuthorView(updatedRequest, user)),
    sendMessageToUsers(releaseManagers, requestInitiatedManagerView(requests, updatedRequest, user)),
    postMessageToBotChannel(requestInitiatedChannelView(updatedRequest, user)),
    addCommentOnFile(file.id, requestInitiatedCommentView(user))
  ])
}

const handleIfRejectRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {}
  if (callback_id !== approvalMapping.callback_id || name !== approvalMapping.reject) return

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
    sendMessage(requestData.user.id, requestRejectedAuthorView(requestData, user)),
    sendMessageToUsers(releaseManagers, requestRejectedManagerView(requestData, user)),
    addCommentOnFile(file.id, requestRejectedCommentView(user))
  ])
}

module.exports = {
  handleIfRequestDialogAction,
  handleIfInitiateRequestAction,
  handleIfRejectRequestAction
}
