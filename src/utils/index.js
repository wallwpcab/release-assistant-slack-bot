const { split, reject, map } = require('ramda')

const splitValues = (str, sep = /[\s+,]/) => reject(
  s => !s,
  map(
    s => s.trim(),
    split(sep, str)
  )
)

const findGroup = (patterns, text) => {
  return patterns.map(regEx => {
    const [_, match] = regEx.exec(text) || []
    return match
  }).find(match => !!match)
}

const isAnyMatch = (patterns, text) => {
  return patterns.map(regEx =>
    regEx.test(text)
  ).find(match => match)
}

const getSlackChannels = (text) => {
  const channelExpr = /<#[^<]+>/g
  return text.match(channelExpr) || []
}

const getSlackChannelId = (text) => {
  const channelExpr = /<#([^>]+)>/
  return findGroup([channelExpr], text) || ''
}

const getSlackUsers = (text) => {
  const userExpr = /<@[^<]+>/g
  return text.match(userExpr) || []
}

const getSlackUserId = (text) => {
  const userExpr = /<@([^>]+)>/
  return findGroup([userExpr], text) || ''
}

const isDeployed = (branch, message = '') => {
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

const extractBranch = (message = '') => {
  return findGroup([/Deployed .*\*(.+)\*/], message)
}

module.exports = {
  splitValues,
  getSlackChannels,
  getSlackChannelId,
  getSlackUsers,
  getSlackUserId,
  isDeployed,
  extractBranch
}
