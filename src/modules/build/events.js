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

  // eslint-disable-next-line prefer-const
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

  // eslint-disable-next-line prefer-const
  let { deployments, config, requests } = await readState()
  const { releaseManagers, releaseChannel } = config
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
      releaseChannel,
      stagingBuildChannelView(deployment),
      deployment.getRequestThread()
    )
  ])
}

const handleIfProductionBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.production) {
    return
  }

  // eslint-disable-next-line prefer-const
  let { deployments, requests, config } = await readState()
  const { releaseChannel } = config
  const deployment = findDeployment(deployments, build)

  if (!deployment) {
    log.info(`Build Event > branch:${build.branch} is not found in deployments: ${deployments}`)
    await sendMessageToChannel(releaseChannel, productionBuildChannelView({ build }))
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
    sendMessageToChannel(releaseChannel, productionBuildChannelView(deployment))
  ])
}

module.exports = {
  handleIfBranchBuildEvent,
  handleIfStagingBuildEvent,
  handleIfProductionBuildEvent
}
