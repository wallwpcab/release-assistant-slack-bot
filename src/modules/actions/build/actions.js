const { DeploymentEvent } = require('../../events/mappings')
const { DeploymentStatus } = require('../../request/mappings')
const { readConfig } = require('../../../bot-config')
const { sendEphemeralMessage, sendMessageToUsers } = require('../../slack/integration')
const {
  buildConfirmedAuthorView,
  buildConfirmedManagerView,
  buildIncorrectAuthorView,
  buildIncorrectManagerView
} = require('./views')
const log = require('../../../utils/log')

const handleIfStagingBuildConfirmAction = async ({ callback_id, actions, user }) => {
  if (callback_id !== DeploymentEvent.staging.callback_id) return

  const [{ name, value }] = actions
  if (value !== DeploymentEvent.staging.confirmed) return

  const { depId, reqId } = JSON.parse(name)
  const { requests, deployments, releaseManagers } = await readConfig()
  const deployment = deployments[depId]

  if (!deployment || deployment.status !== DeploymentStatus.staging) {
    log.info(`handleIfStagingBuildAction() > Deployment ${depId} is not in staging anymore`)
    return
  }

  const request = requests[reqId]
  await Promise.all([
    sendEphemeralMessage(user, buildConfirmedAuthorView(deployment.build, request)),
    sendMessageToUsers(releaseManagers, buildConfirmedManagerView(deployment.build, request, user))
  ])
}

const handleIfStagingBuildIncorrectAction = async ({ callback_id, actions, user }) => {
  if (callback_id !== DeploymentEvent.staging.callback_id) return

  const [{ name, value }] = actions
  if (value !== DeploymentEvent.staging.incorrect) return

  const { depId, reqId } = JSON.parse(name)
  const { requests, deployments, releaseManagers } = await readConfig()
  const deployment = deployments[depId]

  if (!deployment || deployment.status !== DeploymentStatus.staging) {
    log.info(`handleIfStagingBuildAction() > Deployment ${depId} is not in staging anymore`)
    return
  }

  const request = requests[reqId]
  await Promise.all([
    sendEphemeralMessage(user, buildIncorrectAuthorView(deployment.build, request)),
    sendMessageToUsers(releaseManagers, buildIncorrectManagerView(deployment.build, request, user))
  ])
}

module.exports = {
  handleIfStagingBuildConfirmAction,
  handleIfStagingBuildIncorrectAction
}
