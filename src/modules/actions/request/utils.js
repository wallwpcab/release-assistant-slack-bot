const { format } = require('date-fns')

const { generateId, getDate } = require('../../../utils/generator')
const { getGitInfo } = require('../../../git-integration')
const { DeploymentStatus } = require('../../request/mappings')
const { getRequestId, getInitialRequests, getRequests, getGroupType } = require('../../request/utils')

const createBuild = (requests, deploymentId) => ({
  branch: `release/${format(getDate(), 'YYYY-MM-DD')}/${getGroupType(requests)}/${deploymentId}`
})

const createDeployment = async (requests) => {
  const { info } = await getGitInfo(true)
  const id = generateId()

  return {
    id,
    status: DeploymentStatus.initial,
    baseCommit: info.gitCommitAbbrev,
    build: createBuild(requests, id),
    requests: requests.map(getRequestId)
  }
}

const getOrCreateDeployment = async (deployments, requests) => {
  let deployment = Object.values(deployments).find(d => d.status === DeploymentStatus.initial)
  const initialRequests = getInitialRequests(requests)

  if (!deployment) {
    deployment = await createDeployment(initialRequests)
  } else {
    const { info } = await getGitInfo(true)
    const requestIds = deployment.requests.concat(
      initialRequests.map(getRequestId)
    )

    deployment = {
      ...deployment,
      baseCommit: info.gitCommitAbbrev,
      requests: requestIds,
      build: createBuild(getRequests(requestIds, requests), deployment.id)
    }
  }

  return deployment
}

module.exports = {
  createDeployment,
  getOrCreateDeployment
}
