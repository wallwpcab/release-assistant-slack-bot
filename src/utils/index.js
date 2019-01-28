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

const getSlackChannelId = (text) => {
  const channelExpr = /<#([^\|>]+)/
  return findGroup([channelExpr], text) || ''
}

const getSlackUsers = (text) => {
  const userExpr = /<@[^<]+>/g
  return text.match(userExpr) || []
}

const getSlackUserId = (text) => {
  const userExpr = /<@([^\|>]+)/
  return findGroup([userExpr], text) || ''
}

const makeTitleCase = (message = '') => message.replace(
  /\w\S*/g, word =>
    word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
)

const slackUser = user => `<@${user.id}>`

module.exports = {
  splitValues,
  findGroup,
  isAnyMatch,
  getSlackChannels,
  getSlackChannelId,
  getSlackUsers,
  getSlackUserId,
  makeTitleCase,
  slackUser
}
