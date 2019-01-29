const { split, reject, map } = require('ramda')

const splitValues = (str, sep = /[\s+,]/) => reject(
  s => !s,
  map(
    s => s.trim(),
    split(sep, str),
  ),
)

const findGroup = (patterns, text) => patterns.map((regEx) => {
  const [, match] = regEx.exec(text) || []
  return match
}).find(match => !!match)

const isAnyMatch = (patterns, text) => patterns.map(regEx => regEx.test(text)).find(match => match)

const getSlackChannels = (text) => {
  const channelExpr = /<#[^<]+>/g
  return text.match(channelExpr) || []
}

const getSlackChannel = (text) => {
  const channelExpr = /<#([^|>]+)/
  const id = findGroup([channelExpr], text)
  const channel = { id }
  return id && channel
}

const getSlackUsers = (text) => {
  const userExpr = /<@[^<]+>/g
  return text.match(userExpr) || []
}

const getSlackUser = (text) => {
  const userExpr = /<@([^|>]+)/
  const id = findGroup([userExpr], text)
  const user = { id }
  return id && user
}

const slackUserTag = user => `<@${user.id}>`

const makeTitleCase = (message = '') => message.replace(
  /\w\S*/g, word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
)

module.exports = {
  splitValues,
  findGroup,
  isAnyMatch,
  getSlackChannels,
  getSlackChannel,
  getSlackUsers,
  getSlackUser,
  makeTitleCase,
  slackUserTag
}
