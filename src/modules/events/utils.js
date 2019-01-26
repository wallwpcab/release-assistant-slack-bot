const { findGroup, isAnyMatch } = require('../../utils')

const hasBranchDeployed = (branch, message = '') => {
  const isDeployed = /^\[\*LIVE\*\] Deployed/.test(message)

  const isSucceed = isAnyMatch([
    /Click .+here.+ to promote .+ to `staging`/, // for branch build
    /Build #.+ status is: \*SUCCESS\*./          // for staging and production build
  ], message)

  const branchName = findGroup([
    /Deployed <.+\*(.+)\*>/,   // for branch build
    /\(HEAD.* origin\/(.+?)\)/ // for staging and production build
  ], message)

  return isDeployed && isSucceed && branchName === branch
}

const getDeploymentEnv = (branch, message = '') => {
  const match = findGroup([/Deployed .*\*(.+)\*/], message)
  switch(match) {
    case branch: return 'branch'
    case 'staging': return 'staging'
    case 'production': return 'production'
    default: return null
  }
}

module.exports = {
  hasBranchDeployed,
  getDeploymentEnv
}
