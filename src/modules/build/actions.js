const { BuildEvent } = require('./mappings')
const { DeploymentStatus } = require('../request/mappings')
const { readState } = require('../../bot-state')
const { sendEphemeralMessage, sendMessageToUsers, sendMessageToChannel } = require('../slack/integration')
const {
  buildConfirmedAuthorView,
  buildConfirmedChannelView,
  buildConfirmedManagerView,
  buildIncorrectAuthorView,
  buildIncorrectManagerView,
  buildIncorrectChannelView
} = require('./action-views')
const log = require('../../utils/log')

const handleIfStagingBuildConfirmAction = async ({ callback_id: callbackId, actions, user }) => {
  if (callbackId !== BuildEvent.staging.callback_id) return

  const [{ name, value }] = actions
  if (value !== BuildEvent.staging.confirmed) return

  const { depId, reqId } = JSON.parse(name)
  const { requests, deployments, config } = await readState()
  const { releaseManagers, releaseChannel } = config
  const deployment = deployments[depId]

  if (!deployment || deployment.status !== DeploymentStatus.staging) {
    log.info(`handleIfStagingBuildAction() > Deployment ${depId} is not in staging anymore`)
    return
  }

  const request = requests[reqId]
  const { file: { thread_ts: threadId } } = request
  await Promise.all([
    sendEphemeralMessage(user, buildConfirmedAuthorView(deployment.build, request)),
    sendMessageToUsers(releaseManagers, buildConfirmedManagerView(deployment.build, request, user)),
    sendMessageToChannel(
      releaseChannel, buildConfirmedChannelView(deployment.build, request, user), threadId
    )
  ])
}

const handleIfStagingBuildIncorrectAction = async ({ callback_id: callbackId, actions, user }) => {
  if (callbackId !== BuildEvent.staging.callback_id) return

  const [{ name, value }] = actions
  if (value !== BuildEvent.staging.incorrect) return

  const { depId, reqId } = JSON.parse(name)
  const { requests, deployments, config } = await readState()
  const { releaseManagers, releaseChannel } = config
  const deployment = deployments[depId]

  if (!deployment || deployment.status !== DeploymentStatus.staging) {
    log.info(`handleIfStagingBuildAction() > Deployment ${depId} is not in staging anymore`)
    return
  }

  const request = requests[reqId]
  const { file: { thread_ts: threadId } } = request
  await Promise.all([
    sendEphemeralMessage(user, buildIncorrectAuthorView(deployment.build, request)),
    sendMessageToUsers(releaseManagers, buildIncorrectManagerView(deployment.build, request, user)),
    sendMessageToChannel(
      releaseChannel, buildIncorrectChannelView(deployment.build, user), threadId
    )
  ])
}

module.exports = {
  handleIfStagingBuildConfirmAction,
  handleIfStagingBuildIncorrectAction
}
