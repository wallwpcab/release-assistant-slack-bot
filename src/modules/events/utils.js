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

const getDeploymentInfo = (message = '') => {
  const branch = findGroup([
    /Deployed <.+\*(.+)\*>/,   // for branch build
    /\(HEAD.* origin\/(.+?)\)/ // for staging and production build
  ], message)

  const commitId = findGroup([/version `(.+)`/], message)
  const buildNo = findGroup([/Build <.+\|#(.+)>/], message)
  const promotionLink = findGroup([/Click <([^\|]+).+here.+ to promote/], message)
  const env = findGroup([/Deployed .*\*(.+)\*/], message)
  const mapEnv = cond([
    [equals(branch), always(DeploymentStatus.branch)],
    [equals('staging'), always(DeploymentStatus.staging)],
    [equals('production'), always(DeploymentStatus.production)],
    [T, always(undefined)]
  ])

  return {
    branch,
    commitId,
    buildNo,
    promotionLink,
    environment: mapEnv(env)
  }
}

const updateDeployment = async (deployment, { commitId, buildNo, promotionLink, environment }) => {
  const updatedDeployment = {
    ...deployment,
    commitId,
    buildNo,
    promotionLink,
    status: environment
  }

  const { deployments } = await readConfig()
  await updateConfig({
    deployments: {
      ...deployments,
      [deployment.id]: updatedDeployment
    }
  })
}

module.exports = {
  isDeploymentEvent,
  isSuccessfullDeployment,
  getDeploymentInfo,
  updateDeployment
}
