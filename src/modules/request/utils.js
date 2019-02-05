const {
  format
} = require('date-fns')

const {
  RequestType,
  RequestStatus,
  DeploymentStatus
} = require('./mappings')
const {
  generateId,
  getDate
} = require('../../utils/generator')
const {
  getGitInfo
} = require('../../git-integration')
const {
  Deployment
} = require('./model')

const getInitialRequests = requests => Object.values(requests)
  .filter(r => r.status === RequestStatus.initial)

const hasType = (requests, type) => requests.find(r => r && r.type === type)

const getGroupType = requests => [
  RequestType.hotfix.value,
  RequestType.activation.value
].map(type => hasType(requests, type) && type)
  .filter(Boolean)
  .join('-')

const createBuild = (requests, deploymentId) => ({
  branch: `release/${getGroupType(requests)}/${format(getDate(), 'YYYYMMDD')}/${deploymentId}`
})

const createDeployment = async (requests) => {
  const {
    info
  } = await getGitInfo(true)
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

  const {
    info
  } = await getGitInfo(true)
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
  getInitialRequests,
  getGroupType,
  createDeployment,
  getOrCreateDeployment
}
