const { cond, equals, always, T } = require('ramda')
const { findGroup, isAnyMatch } = require('../../utils')
const { readConfig, updateConfig } = require('../../bot-config')
const { DeploymentStatus } = require('../request/mappings')

const isDeploymentEvent = (message = '') => {
  return /^\[\*LIVE\*\] Deployed/.test(message)
}

const isSuccessfullDeployment = (message = '') => {
  return isAnyMatch([
    /Click .+here.+ to promote .+ to `staging`/, // for branch build
    /Build #.+ status is: \*SUCCESS\*/          // for staging and production build
  ], message)
}

const getBuildInfo = (message = '') => {
  const branch = findGroup([
    /Deployed <.+\*(.+)\*>/,   // for branch build
    /\(HEAD.* origin\/(.+?)\)/ // for staging and production build
  ], message)

  const id = findGroup([/Build <.+\|#(.+)>/], message)
  const commitId = findGroup([/version `(.+)`/], message)
  const triggerLink = findGroup([/Click <([^\|]+).+here.+ to promote/], message)
  const env = findGroup([/Deployed .*\*(.+)\*/], message)
  const mapEnv = cond([
    [equals(branch), always(DeploymentStatus.branch)],
    [equals('staging'), always(DeploymentStatus.staging)],
    [equals('production'), always(DeploymentStatus.production)],
    [T, always(undefined)]
  ])

  return {
    id,
    branch,
    commitId,
    triggerLink,
    environment: mapEnv(env)
  }
}

const updateDeployment = async (deployment, build) => {
  const updatedDeployment = {
    ...deployment,
    status: build.environment,
    build
  }

  const { deployments: currentDeployments } = await readConfig()
  const deployments = {
    ...currentDeployments,
    [deployment.id]: updatedDeployment
  }

  if (build.environment === DeploymentStatus.staging) {
    deployments.staging = updatedDeployment
  }

  await updateConfig({
    deployments
  })
}

module.exports = {
  isDeploymentEvent,
  isSuccessfullDeployment,
  getBuildInfo,
  updateDeployment
}
