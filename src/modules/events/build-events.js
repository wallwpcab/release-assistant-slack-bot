const { branchBuildManagerView } = require('./views')
const { readConfig, updateConfig } = require('../../bot-config')
const { sendMessageToUsers } = require('../slack/integration')
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

module.exports = {
  handleIfBranchBuildEvent
}
