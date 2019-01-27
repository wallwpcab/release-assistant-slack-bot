const { format } = require('date-fns')

const { generateId, getDate } = require('../../../utils/generator')
const { getGitInfo } = require('../../../git-integration')
const { RequestType, RequestStatus, DeploymentStatus } = require('../../request/mappings')

const getInitialRequests = (requests) => {
  return Object.values(requests).filter(r => r.status === RequestStatus.initial)
}

const createBuild = (type, deploymentId) => ({
  branch: `release/${format(getDate(), 'YY-MM-DD')}/${type}/${deploymentId}`
})

const getGroupType = (requests) => {
  const hasType = (requests, type) => requests.find(r => r.type === type)

  return [
    RequestType.hotfix.value,
    RequestType.activation.value
  ].map(type => hasType(requests, type) && type)
    .filter(Boolean)
    .join('-')
}

const createDeployment = async (requests) => {
  const { info } = await getGitInfo(true)
  const id = generateId()

  return {
    id,
    status: DeploymentStatus.initial,
    baseCommit: info.gitCommitAbbrev,
    build: createBuild(getGroupType(requests), id),
    requests: requests.map(r => r.id)
  }
}

const getOrCreateDeployment = async (deployments, requests) => {
  let deployment = Object.values(deployments).find(d => d.status === DeploymentStatus.initial)
  const initialRequests = getInitialRequests(requests)

  if (!deployment) {
    deployment = await createDeployment(initialRequests)
  } else {
    const { info } = await getGitInfo(true)
    deployment.baseCommit = info.gitCommitAbbrev
    deployment.requests = deployment.requests.concat(
      initialRequests.map(r => r.id)
    )
  }

  return deployment
}

const updateObject = (parent, child, key = 'id') => {
  return {
    ...parent,
    [child[key]]: child
  }
}

module.exports = {
  getInitialRequests,
  createDeployment,
  getOrCreateDeployment,
  updateObject,
  getGroupType
}
