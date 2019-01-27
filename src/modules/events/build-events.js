const { mergeRight } = require('ramda')
const { branchBuildManagerView, stagingBuildManagerView } = require('./views')
const { readConfig, updateConfig } = require('../../bot-config')
const { sendMessageToUsers, postMessageToBotChannel } = require('../slack/integration')
const log = require('../../utils/log')
const { DeploymentStatus } = require('../request/mappings')
const {
  updateDeployments
} = require('./utils')

const handleIfBranchBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.branch) {
    return
  }

  const { deployments, releaseManagers } = await readConfig()
  const deployment = Object.values(deployments)
    .find(d => d.build.branch === build.branch)

  if (!deployment) {
    log.log(`Build Event > branch:${branch} is not found in deployments: ${deployments}`)
    return
  }

  await Promise.all([
    updateConfig({
      deployments: updateDeployments(deployments, deployment, build)
    }),
    sendMessageToUsers(releaseManagers, branchBuildManagerView(build))
  ])
}

const handleIfStagingBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.staging) {
    return
  }

  let { deployments, releaseManagers } = await readConfig()
  const deployment = Object.values(deployments)
    .find(d => d.build.branch === build.branch)

  deployments = mergeRight(deployments, {
    staging: {
      build
    }
  })

  if (!deployment) {
    log.log(`Build Event > branch:${branch} is not found in deployments: ${deployments}`)
    await updateConfig({ deployments })
    return
  }

  await Promise.all([
    updateConfig({
      deployments: updateDeployments(deployments, deployment, build)
    }),
    sendMessageToUsers(releaseManagers, stagingBuildManagerView(build))
  ])
}

const handleIfProductionBuildEvent = async (build) => {
  if (build.environment !== DeploymentStatus.production) {
    return
  }

  let { deployments } = await readConfig()
  const deployment = Object.values(deployments)
    .find(d => d.build.branch === build.branch)

  if (!deployment) {
    log.log(`Build Event > branch:${branch} is not found in deployments: ${deployments}`)
    return
  }

  await Promise.all([
    updateConfig({
      deployments: updateDeployments(deployments, deployment, build)
    }),
    postMessageToBotChannel(stagingBuildManagerView(build))
  ])
}

module.exports = {
  handleIfBranchBuildEvent,
  handleIfStagingBuildEvent,
  handleIfProductionBuildEvent
}
