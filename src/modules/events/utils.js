const { findGroup, isAnyMatch } = require('../../utils')

const isDeploymentEvent = (message) => {
  const isDeployed = /^\[\*LIVE\*\] Deployed/.test(message)

  const isSucceed = isAnyMatch([
    /Click .+here.+ to promote .+ to `staging`/, // for branch build
    /Build #.+ status is: \*SUCCESS\*./          // for staging and production build
  ], message)

  return isDeployed && isSucceed
}

const getDeploymentInfo = (message = '') => {
  const branch = findGroup([
    /Deployed <.+\*(.+)\*>/,   // for branch build
    /\(HEAD.* origin\/(.+?)\)/ // for staging and production build
  ], message)

  const env = findGroup([/Deployed .*\*(.+)\*/], message)
  const environment = branch && env === branch ? 'branch' : env

  return {
    branch,
    environment
  }
}

module.exports = {
  isDeploymentEvent,
  getDeploymentInfo
}
