const {
  cond, equals, always, T, mergeRight, path, isNil
} = require('ramda')

const { findGroup, isAnyMatch } = require('../../utils')
const { Deployment } = require('../request/model')
const { DeploymentStatus } = require('../request/mappings')

const isDeploymentEvent = (message = '') => /^\[\*LIVE\*\] Deployed/.test(message)

const isSuccessfullDeployment = (message = '') => isAnyMatch([
  /Click .+here.+ to promote .+ to `staging`/, // for branch build
  /Build .+ status is: \*SUCCESS\*/ // for staging and production build
], message)

const getBuildInfo = (message = '') => {
  const branch = findGroup([
    /Deployed <.+\*(.+)\*>/, // for branch build
    /\(HEAD.* origin\/(.+?)\)/ // for staging and production build
  ], message)

  const id = findGroup([/Build <.+\|#(.+)>/], message)
  const commitId = findGroup([/version `(.+)`/], message)
  const infoLink = findGroup([/Build <(.+)\|#.+>/], message)
  const triggerLink = findGroup([/Click <([^|]+).+here.+ to promote/], message)
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
    infoLink,
    triggerLink,
    environment: mapEnv(env)
  }
}

const updateDeployments = (deployments, deployment, build) => {
  if (!deployment || !build) {
    return deployments
  }

  return mergeRight(deployments, {
    [deployment.id]: mergeRight(deployment, {
      status: build.environment,
      build
    })
  })
}

const findDeployment = (deployments, build) => {
  const deployment = Object.values(deployments)
    .filter(d => !isNil(d.id))
    .find(d => path(['build', 'branch'], d) === build.branch)
  return deployment ? new Deployment(deployment) : null
}

const updateStagingBuild = (deployments, build) => mergeRight(deployments, {
  staging: { build }
})

module.exports = {
  isDeploymentEvent,
  isSuccessfullDeployment,
  getBuildInfo,
  updateDeployments,
  findDeployment,
  updateStagingBuild
}
