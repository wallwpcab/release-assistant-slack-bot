const express = require('express');
const minimist = require('minimist');
const axios = require('axios');
const { pathOr } = require('ramda');

const { log, splitValues, extractSlackUsers, extractSlackChannelId } = require('./utils');
const { getRequestData, getConfigData } = require('./transformer');
const {
  requestCallbackId,
  configCallbackId,
  requestDialogView,
  requestConfirmView,
  configReadView,
  configDialogView,
  requestApprovalView,
  proceedRequestAlreadyInitiatedView,
  proceedRequestManagerView,
  proceedRequestChannelView,
  proceedRequestAuthorView,
  rejectRequestManagerView,
  rejectRequestAuthorView,
  releaseManagerUpdateView,
  proceedRequestCommentView,
  rejectRequestCommentView,
  showProgressView,
  confirmCancelProgressView,
  cancelProgressNotPossibleView,
  cancelProgressAuthorView,
  cancelProgressManagerView,
  cancelProgressCommentView,
  invalidRequestIdView,
  approval,
  cancelRequest,
  requestTypes
} = require('./modules/slack/views');
const { readConfig, updateConfig } = require('./bot-config');
const {
  openDialog,
  sendMessageToUsers,
  sendMessageToBotChannel,
  uploadRequestData,
  addCommentOnFile
} = require('./modules/slack/integration');
const { getGitInfo } = require('./git-integration');

const router = express.Router();

const handleIfReadConfig = async (args, res) => {
  if (args.update) return;

  const config = await readConfig();
  res.send(configReadView(config))
}

const handleIfEditConfig = async (args, { trigger_id }, res) => {
  if (!args.update) return;

  const config = await readConfig();
  const {
    deployChannel = config.deployChannel,
    botChannel = config.botChannel,
  } = args

  const configValue = JSON.stringify({
    ...config,
    deployChannel,
    botChannel
  }, null, 2);

  try {
    await openDialog(trigger_id, configDialogView(configValue))
    res.send();
  } catch (err) {
    log.error('handleIfEditConfig() > openDialog failed', err);
    res.sendStatus(500);
  }
}

router.post('/slack/command/config', async (req, res) => {
  const { text } = req.body;
  const args = minimist(splitValues(text))

  handleIfReadConfig(args, res);
  handleIfEditConfig(args, req.body, res)
});

router.post('/slack/command/request', async (req, res) => {
  const { text, trigger_id } = req.body || {};

  try {
    await openDialog(trigger_id, requestDialogView(text))
    res.send();
  } catch (err) {
    log.error('/slack/command/request > openDialog() failed', err);
    res.sendStatus(500);
  }
});

const handleIfViewProgress = async (args, res) => {
  if (args.cancel) return;

  const { id } = args;
  const { requests } = await readConfig();

  if(!id) {
    const requestArray = Object.values(requests).map(v => v);
    res.send(showProgressView(requestArray));
    return
  }

  if(requests[id]) {
    res.send(showProgressView([requests[id]]));
    return
  }

  res.send(invalidRequestIdView(id))
  log.info('handleIfViewProgress() error')
}

const handleIfCancelProgress = async (args, res) => {
  if (!args.cancel) return;

  const { id } = args;
  const { requests } = await readConfig();

  if(!requests[id]) {
    log.info('handleIfCancelProgress() error')
    res.send(invalidRequestIdView(id))
    return
  }

  const request = requests[id]
  if(request.progress) {
    res.send(cancelProgressNotPossibleView(request))
    return
  }
  res.send(confirmCancelProgressView(request))

}

router.post('/slack/command/progress', async (req, res) => {
  const { text } = req.body
  const args = minimist(splitValues(text))

  handleIfViewProgress(args, res)
  handleIfCancelProgress(args, res)
});

const handleDialogSubmission = async (callback_id, response_url, submission, user) => {
  if (callback_id === requestCallbackId) {
    const rawData = getRequestData(submission, user);
    const { id: fileId, permalink: fileLink } = await uploadRequestData(rawData);
    const requestData = {
      ...rawData,
      fileId,
      fileLink
    };

    await axios.post(response_url, requestConfirmView(requestData))
    const { releaseManagers } = await readConfig();

    const { id } = requestData;
    await updateConfig({
      requests: {
        [id]: requestData
      }
    });
    await sendMessageToUsers(releaseManagers, requestApprovalView(requestData));

  } else if (callback_id === configCallbackId) {
    const config = getConfigData(submission);
    const updatedConfig = await updateConfig(config);
    return axios.post(response_url, configReadView(updatedConfig))
  }
}

const handleIfAprovalToProceed = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {};
  if (callback_id !== approval.callback_id || name !== approval.proceed) return;

  const { releaseManagers, requests } = await readConfig();
  const requestData = pathOr(null, [requestId], requests);
  if (!requestData) {
    await sendMessageToUsers([`<@${user.id}>`], invalidRequestIdView(requestId));
    return;
  }

  if (requestData.progress) {
    await sendMessageToUsers([`<@${user.id}>`], proceedRequestAlreadyInitiatedView(requestData));
    return;
  }

  const { type, fileId } = requestData;
  const { info } = await getGitInfo(type === requestTypes.hotfix.value);

  const updatedRequest = {
    ...requestData,
    progress: approval.proceed,
    baseCommit: info.gitCommitAbbrev,
    initiator: user
  }

  const updatedRequests = {
    [requestId]: updatedRequest
  }

  await updateConfig({ requests: updatedRequests });
  await sendMessageToUsers(releaseManagers, proceedRequestManagerView(requests, updatedRequest, user));
  await sendMessageToUsers([`<@${updatedRequest.user.id}>`], proceedRequestAuthorView(updatedRequest, user));
  await sendMessageToBotChannel(proceedRequestChannelView(updatedRequest, user));
  await addCommentOnFile(fileId, proceedRequestCommentView(user));
}

const handleIfAprovalToReject = async ({ callback_id, actions: [action], user }) => {
  const { name, value: requestId } = action || {};
  if (callback_id !== approval.callback_id || name !== approval.reject) return;

  const config = await readConfig();
  const { releaseManagers, requests } = config;
  const requestData = pathOr(null, [requestId], requests);
  if (!requestData) {
    await sendMessageToUsers([`<@${user.id}>`], invalidRequestIdView(requestId));
    return;
  }

  if (requestData.progress) {
    await sendMessageToUsers([`<@${user.id}>`], proceedRequestAlreadyInitiatedView(requestData));
    return;
  }

  const { fileId } = requestData;
  delete requests[requestId];
  await updateConfig({ requests }, true);
  await sendMessageToUsers(releaseManagers, rejectRequestManagerView(requestData, user));
  await sendMessageToUsers([`<@${requestData.user.id}>`], rejectRequestAuthorView(requestData, user));
  await addCommentOnFile(fileId, rejectRequestCommentView(user));
}

const handleIfCancelRequest = async ({ callback_id, actions: [action], user }) => {
  const { name, value } = action || {};
  if (callback_id !== cancelRequest.callback_id || name !== cancelRequest.yes) return;

  const config = await readConfig();
  const { releaseManagers, requests } = config;
  const requestData = pathOr(null, [value], requests);
  if (!requestData || requestData.progress) {
    log.info(`handleIfCancelRequest() invalid request: ${value}`, requestData);
    return;
  }

  const { fileId } = requestData;
  delete requests[value];
  await updateConfig({ requests }, true);
  await sendMessageToUsers([`<@${user.id}>`], cancelProgressAuthorView(requestData));
  await sendMessageToUsers(releaseManagers, cancelProgressManagerView(requestData, user));
  await addCommentOnFile(fileId, cancelProgressCommentView(user));
}

router.post('/slack/actions', async (req, res) => {
  const payload = JSON.parse(pathOr('{}', ['body', 'payload'], req))
  const { type, callback_id, response_url, submission, user } = payload;

  console.log('/slack/actions', )

  if (type === 'dialog_submission') {
    try {
      handleDialogSubmission(callback_id, response_url, submission, user)
    } catch (err) {
      log.error('/slack/actions > sendMessage() failed', err);
    }
  } if (type === 'interactive_message') {
    handleIfAprovalToProceed(payload);
    handleIfAprovalToReject(payload);
    handleIfCancelRequest(payload);
  }

  res.send();
});

const handleIfTopicChanged = async ({ type, subtype, text, topic, channel }) => {
  const { botChannel } = await readConfig();

  if (
    extractSlackChannelId(botChannel) !== channel
    || type !== 'message'
    || !['group_topic', 'channel_topic'].includes(subtype)
  ) {
    return;
  }

  const [author] = extractSlackUsers(text);
  const releaseManagers = extractSlackUsers(topic);
  await updateConfig({ releaseManagers })
  await sendMessageToBotChannel(releaseManagerUpdateView(author, releaseManagers));
}

router.post('/slack/events', async (req, res) => {
  const event = pathOr({}, ['body', 'event'], req);

  console.log(req.body);
  console.log('---------------------------------------------');

  handleIfTopicChanged(event);

  res.send(req.body.challenge);
});

module.exports = router;


// [*LIVE*] Deployed *master* (auth: glass/Glass-Passw0rd) version `786251e`.
// Build #689 status is: *SUCCESS*. test results / artifacts / commits / changelog

// ```786251e - (HEAD, origin/master) Merge pull request #2378 in GLASS/glass from CHK-7316 to master (2018-12-12T15:31:05+01:00) <Gomes, Yuri>```

// Click *here* to promote `786251e` to `staging` environment. deployment plan
