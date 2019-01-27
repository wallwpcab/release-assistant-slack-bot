const { format } = require('date-fns')

const { readConfig } = require('../../../bot-config')
const { generateId } = require('../../../utils/generator')
const { getGitInfo } = require('../../../git-integration')
const { RequestStatus, DeploymentStatus } = require('../../request/mappings')

const getInitialRequests = (requests)=> {
  return Object.values(requests).filter(r => r.status === RequestStatus.initial)
}

const createBuild = (requestType, deploymentId) => ({
  branch: `release/${format(new Date(), 'YY-MM-DD')}/${requestType}/${deploymentId}`
})

const createDeployment = async (requestType) => {
  const { info } = await getGitInfo(true)
  const id = generateId()

  return {
    id,
    status: DeploymentStatus.initial,
    baseCommit: info.gitCommitAbbrev,
    build: createBuild(requestType, id),
    requests: []
  }
}

const getOrCreateDeployment = async (deployments, requestType) => {
  let deployment = Object.values(deployments).find(d => d.status === DeploymentStatus.initial)
  if (!deployment) {
    deployment = await createDeployment(requestType)
  } else {
    const { info } = await getGitInfo(true)
    deployment.baseCommit = info.gitCommitAbbrev
  }

  return deployment
}

module.exports = {
  getInitialRequests,
  createDeployment,
  getOrCreateDeployment
}
