const { DeploymentEvent } = require('../../events/mappings')
const { DeploymentStatus } = require('../../request/mappings')
const { readConfig } = require('../../../bot-config')
const { sendMessageToUsers } = require('../../slack/integration')
const {
  buildConfirmedManagerView,
  buildIncorrectManagerView
} = require('./views')
const log = require('../../../utils/log')

const handleIfStagingBuildConfirmAction = async ({ callback_id, actions, user }) => {
  if (callback_id !== DeploymentEvent.staging.callback_id) return
  
  const [{ name, value }] = actions
  if(value !== DeploymentEvent.staging.confirmed) return

  const { depId, reqId } = JSON.parse(name)
  const { requests, deployments, releaseManagers } = await readConfig()
  const deployment = deployments[depId]

  if (!deployment || deployment.status !== DeploymentStatus.staging) {
    log.info(`handleIfStagingBuildAction() > Deployment ${depId} is not in staging anymore`)
  }

  const request = requests[reqId]
  sendMessageToUsers(releaseManagers, buildConfirmedManagerView(user, request, deployment.build))
}

const handleIfStagingBuildIncorrectAction = async ({ callback_id, actions, user }) => {
  if (callback_id !== DeploymentEvent.staging.callback_id) return
  
  const [{ name, value }] = actions
  if(value !== DeploymentEvent.staging.incorrect) return

  const { depId, reqId } = JSON.parse(name)
  const { requests, deployments, releaseManagers } = await readConfig()
  const deployment = deployments[depId]

  if (!deployment || deployment.status !== DeploymentStatus.staging) {
    log.info(`handleIfStagingBuildAction() > Deployment ${depId} is not in staging anymore`)
  }

  const request = requests[reqId]
  sendMessageToUsers(releaseManagers, buildIncorrectManagerView(user, request, deployment.build))
}

module.exports = {
  handleIfStagingBuildConfirmAction,
  handleIfStagingBuildIncorrectAction
}
