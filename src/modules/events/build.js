const log = require('../../utils/log')
const { updateByKeys, updateById } = require('../../utils')
const { readConfig, updateConfig } = require('../../bot-config')
const { sendMessageToUsers, sendMessageToChannel } = require('../slack/integration')
const { RequestStatus, DeploymentStatus } = require('../request/mappings')
const { findDeployment, updateStagingBuild } = require('./utils')
const {
  branchBuildManagerView,
  stagingBuildManagerView,
  stagingBuildChannelView,
  productionBuildChannelView
} = require('./views')

const handleIfBranchBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.branch) {
    return
  }

  let { deployments, releaseManagers, requests } = await readConfig()
  const deployment = findDeployment(deployments, build)

  if (!deployment) {
    log.info(`Build Event > branch:${build.branch} is not found in deployments: ${deployments}`)
    return
  }

  deployment.mapRequests(requests)
  deployment.update({
    status: DeploymentStatus.branch,
    build
  })
  deployments = updateById(deployments, deployment.export())

  const keys = deployment.export().requests
  requests = updateByKeys(requests, keys, () => ({
    status: RequestStatus.branch
  }))

  await Promise.all([
    updateConfig({ deployments, requests }),
    sendMessageToUsers(releaseManagers, branchBuildManagerView(deployment))
  ])
}

const handleIfStagingBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.staging) {
    return
  }

  let { deployments, releaseManagers, botChannel, requests } = await readConfig()
  deployments = updateStagingBuild(deployments, build)
  const deployment = findDeployment(deployments, build)

  if (!deployment) {
    log.info(`Build Event > branch:${build.branch} is not found in deployments: ${deployments}`)
    await updateConfig({ deployments })
    return
  }

  deployment.mapRequests(requests)
  deployment.update({
    status: DeploymentStatus.staging,
    build
  })
  deployments = updateById(deployments, deployment.export())

  const keys = deployment.export().requests
  requests = updateByKeys(requests, keys, () => ({
    status: RequestStatus.staging
  }))

  await Promise.all([
    updateConfig({ deployments, requests }),
    sendMessageToUsers(releaseManagers, stagingBuildManagerView(deployment)),
    sendMessageToChannel(
      botChannel,
      stagingBuildChannelView(deployment),
      deployment.getRequestThread()
    )
  ])
}

const handleIfProductionBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.production) {
    return
  }

  let { deployments, requests, botChannel } = await readConfig()
  const deployment = findDeployment(deployments, build)

  if (!deployment) {
    log.info(`Build Event > branch:${build.branch} is not found in deployments: ${deployments}`)
    return
  }

  deployment.mapRequests(requests)
  deployment.update({
    status: DeploymentStatus.production,
    build
  })
  deployments = updateById(deployments, deployment.export())

  const keys = deployment.export().requests
  requests = updateByKeys(requests, keys, () => ({
    status: RequestStatus.production
  }))

  await Promise.all([
    updateConfig({ deployments, requests }),
    sendMessageToChannel(botChannel, productionBuildChannelView(deployment))
  ])
}

module.exports = {
  handleIfBranchBuildEvent,
  handleIfStagingBuildEvent,
  handleIfProductionBuildEvent
}
