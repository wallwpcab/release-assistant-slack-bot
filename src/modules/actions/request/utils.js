const { format } = require('date-fns')

const { generateId, getDate } = require('../../../utils/generator')
const { getGitInfo } = require('../../../git-integration')
const { DeploymentStatus } = require('../../request/mappings')
const { Deployment } = require('./model')
const {
  getRequestId,
  getInitialRequests,
  getRequests,
  getGroupType
} = require('../../request/utils')

const createBuild = (requests, deploymentId) => ({
  branch: `release/${format(getDate(), 'YYYY-MM-DD')}/${getGroupType(requests)}/${deploymentId}`
})

const createDeployment = async (requests) => {
  const { info } = await getGitInfo(true)
  const id = generateId()

  const deployment = new Deployment({
    id,
    status: DeploymentStatus.initial,
    baseCommit: info.gitCommitAbbrev,
    build: createBuild(requests, id),
    requests
  })
  return deployment
}

const getOrCreateDeployment = async (deployments, requests) => {
  const deployment = Object.values(deployments).find(d => d.status === DeploymentStatus.initial)
  const pendingRequests = getInitialRequests(requests)

  if (!deployment) {
    return createDeployment(pendingRequests)
  }

  const { info } = await getGitInfo(true)
  const combinedRequests = deployment.requests.map(r => requests[r.id])
    .concat(pendingRequests)

  return new Deployment({
    ...deployment,
    baseCommit: info.gitCommitAbbrev,
    requests: combinedRequests,
    build: createBuild(combinedRequests, deployment.id)
  })
}

module.exports = {
  createDeployment,
  getOrCreateDeployment
}
