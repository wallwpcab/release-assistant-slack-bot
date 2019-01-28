const { format } = require('date-fns')

const { generateId, getDate } = require('../../../utils/generator')
const { getGitInfo } = require('../../../git-integration')
const { RequestType, RequestStatus, DeploymentStatus } = require('../../request/mappings')

const getInitialRequests = (requests) => {
  return Object.values(requests).filter(r => r.status === RequestStatus.initial)
}

const getGroupType = (requests) => {
  const hasType = (requests, type) => requests.find(r => r.type === type)

  return [
    RequestType.hotfix.value,
    RequestType.activation.value
  ].map(type => hasType(requests, type) && type)
    .filter(Boolean)
    .join('-')
}

const createBuild = (requests, deploymentId) => ({
  branch: `release/${format(getDate(), 'YYYY-MM-DD')}/${getGroupType(requests)}/${deploymentId}`
})

const trimRequestForDeployment = ({ id, type, commits, user }) => ({ id, type, commits, user })

const createDeployment = async (requests) => {
  const { info } = await getGitInfo(true)
  const id = generateId()

  return {
    id,
    status: DeploymentStatus.initial,
    baseCommit: info.gitCommitAbbrev,
    build: createBuild(requests, id),
    requests: requests.map(trimRequestForDeployment)
  }
}

const getOrCreateDeployment = async (deployments, requests) => {
  let deployment = Object.values(deployments).find(d => d.status === DeploymentStatus.initial)

  if (!deployment) {
    deployment = await createDeployment(requests)
  } else {
    const { info } = await getGitInfo(true)
    const mergedRequests = deployment.requests.concat(
      requests.map(trimRequestForDeployment)
    )

    deployment = {
      ...deployment,
      baseCommit: info.gitCommitAbbrev,
      requests: mergedRequests,
      build: createBuild(mergedRequests, deployment.id)
    }
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
  getGroupType,
  trimRequestForDeployment
}
