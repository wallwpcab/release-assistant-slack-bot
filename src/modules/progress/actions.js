const { pathOr } = require('ramda');

const { cancelRequestMappings } = require('./mappings');
const { requestCanceledAuthorView, requestCanceledManagerView, requestCanceledCommentView } = require('./views');
const { readConfig, updateConfig } = require('../../bot-config');
const log = require('../../utils/log');
const {
  sendMessage,
  sendMessageToUsers,
  addCommentOnFile
} = require('../slack/integration');

const handleIfCancelRequestAction = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {};
  if (callback_id !== cancelRequestMappings.callback_id || name !== cancelRequestMappings.yes) return;

  const config = await readConfig();
  const { releaseManagers, requests } = config;
  const requestData = pathOr(null, [requestId], requests);
  if (!requestData || requestData.progress) {
    log.info(`handleIfCancelRequestAction() invalid request: ${requestId}`, requestData);
    return;
  }

  const { fileId } = requestData;
  delete requests[requestId];
  await updateConfig({ requests }, true);
  await sendMessage(user.id, requestCanceledAuthorView(requestData));
  await sendMessageToUsers(releaseManagers, requestCanceledManagerView(requestData, user));
  await addCommentOnFile(fileId, requestCanceledCommentView(user));
}

module.exports = {
  handleIfCancelRequestAction
}
