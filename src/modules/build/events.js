const log = require('../../utils/log')
const { updateByKeys, updateById } = require('../../utils')
const { readState, updateState } = require('../../bot-state')
const { sendMessageToUsers, sendMessageToChannel } = require('../slack/integration')
const { RequestStatus, DeploymentStatus } = require('../request/mappings')
const { findDeployment, updateStagingBuild } = require('./utils')
const {
  branchBuildManagerView,
  stagingBuildManagerView,
  stagingBuildChannelView,
  productionBuildChannelView
} = require('./event-views')

const handleIfBranchBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.branch) {
    return
  }

  let { config, deployments, requests } = await readState()
  const { releaseManagers } = config
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
    updateState({ deployments, requests }),
    sendMessageToUsers(releaseManagers, branchBuildManagerView(deployment))
  ])
}

const handleIfStagingBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.staging) {
    return
  }

  let { deployments, config, requests } = await readState()
  const { releaseManagers, botChannel } = config
  deployments = updateStagingBuild(deployments, build)
  const deployment = findDeployment(deployments, build)

  if (!deployment) {
    log.info(`Build Event > branch:${build.branch} is not found in deployments: ${deployments}`)
    await updateState({ deployments })
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
    updateState({ deployments, requests }),
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

  let { deployments, requests, config } = await readState()
  const { botChannel } = config
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
    updateState({ deployments, requests }),
    sendMessageToChannel(botChannel, productionBuildChannelView(deployment))
  ])
}

module.exports = {
  handleIfBranchBuildEvent,
  handleIfStagingBuildEvent,
  handleIfProductionBuildEvent
}
