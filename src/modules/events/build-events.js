const { pick, mergeWith, mergeRight } = require('ramda')
const { branchBuildManagerView, stagingBuildManagerView, stagingBuildChannelView } = require('./views')
const { readConfig, updateConfig } = require('../../bot-config')
const { sendMessageToUsers, sendMessageToChannel } = require('../slack/integration')
const log = require('../../utils/log')
const { RequestStatus, DeploymentStatus } = require('../request/mappings')
const {
  findDeployment,
  updateDeployments
} = require('./utils')

const handleIfBranchBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.branch) {
    return
  }

  let { deployments, releaseManagers, requests } = await readConfig()
  const deployment = findDeployment(deployments, build)

  if (!deployment) {
    log.log(`Build Event > branch:${branch} is not found in deployments: ${deployments}`)
    return
  }

  deployments = updateDeployments(deployments, deployment, build)
  requests = mergeWith(request => ({
    ...request,
    status: RequestStatus.branch
  }),
    requests,
    pick(deployment.requests, requests)
  )

  await Promise.all([
    updateConfig({ deployments, requests }),
    sendMessageToUsers(releaseManagers, branchBuildManagerView(build))
  ])
}

const handleIfStagingBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.staging) {
    return
  }

  let { deployments, releaseManagers, botChannel, requests } = await readConfig()
  const deployment = findDeployment(deployments, build)
  deployments = mergeRight(deployments, {
    staging: { build }
  })

  if (!deployment) {
    log.log(`Build Event > branch:${branch} is not found in deployments: ${deployments}`)
    await updateConfig({ deployments })
    return
  }

  deployments = updateDeployments(deployments, deployment, build)
  requests = mergeWith(request => ({
    ...request,
    status: RequestStatus.staging
  }),
    requests,
    pick(deployment.requests, requests)
  )

  await Promise.all([
    updateConfig({ deployments, requests }),
    sendMessageToUsers(releaseManagers, stagingBuildManagerView(build)),
    sendMessageToChannel(botChannel, stagingBuildChannelView(build))
  ])
}

const handleIfProductionBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.production) {
    return
  }

  let { deployments, requests, botChannel } = await readConfig()
  const deployment = findDeployment(deployments, build)

  if (!deployment) {
    log.log(`Build Event > branch:${branch} is not found in deployments: ${deployments}`)
    return
  }

  deployments = updateDeployments(deployments, deployment, build)
  requests = mergeWith(request => ({
    ...request,
    status: RequestStatus.staging
  }),
    requests,
    pick(deployment.requests, requests)
  )

  await Promise.all([
    updateConfig({ deployments, requests }),
    sendMessageToChannel(botChannel, stagingBuildManagerView(build))
  ])
}

module.exports = {
  handleIfBranchBuildEvent,
  handleIfStagingBuildEvent,
  handleIfProductionBuildEvent
}
