const { split, reject, map } = require('ramda')

const splitValues = (str, sep = /[\s+,]/) => reject(
  s => !s,
  map(
    s => s.trim(),
    split(sep, str)
  )
)

const extractSlackChannels = (text) => {
  const channelExpr = /<#[^<]+>/g
  const matches = text.match(channelExpr) || []
  return matches
}

const extractSlackChannelId = (text) => {
  const channelExpr = /<#([^>]+)>/
  const [_, match] = text.match(channelExpr) || ['', '']
  return match
}

const extractSlackUsers = (text) => {
  const userExpr = /<@[^<]+>/g
  const matches = text.match(userExpr) || []
  return matches
}

const extractSlackUserId = (text) => {
  const userExpr = /<@([^>]+)>/
  const [_, match] = text.match(userExpr) || []
  return match
}

const isDeployed = (branch, message = '') => {
  const isDeployed = /^\[\*LIVE\*\] Deployed/.test(message)
  const [_, branchMatch] = /Deployed <.*\*(.+)\*>/.exec(message) || []
  const [__, stagingProductionMatch] = /origin\/([^\)]+)/.exec(message) || []
  const match = branchMatch || stagingProductionMatch
  return isDeployed && match === branch
}

const extractBranch = (message = '') => {
  const [_, branch] = /Deployed .*\*(.+)\*/.exec(message) || []
  return branch
}

module.exports = {
  splitValues,
  extractSlackChannels,
  extractSlackChannelId,
  extractSlackUsers,
  extractSlackUserId,
  isDeployed,
  extractBranch
}
