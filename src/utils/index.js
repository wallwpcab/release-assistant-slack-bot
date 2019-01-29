const { split, reject, map, mergeRight } = require('ramda')

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

const getSlackChannelTags = (text) => {
  const channelExpr = /<#[^<]+>/g
  return text.match(channelExpr) || []
}

const getSlackChannel = (text) => {
  const idExpr = /<#([^|>]+)/
  const nameExpr = /<#.+\|([^>]+)/
  const id = findGroup([idExpr], text)
  const name = findGroup([nameExpr], text)
  const channel = { id, name }
  return id && channel
}

const getSlackUserTags = (text) => {
  const userExpr = /<@[^<]+>/g
  return text.match(userExpr) || []
}

const getSlackUser = (text) => {
  const idExpr = /<@([^|>]+)/
  const nameExpr = /<@.+\|([^>]+)/
  const id = findGroup([idExpr], text)
  const name = findGroup([nameExpr], text)
  const user = { id, name }
  return id && user
}

const slackUserTag = user => `<@${user.id}>`

const makeTitleCase = (message = '') => message.replace(
  /\w\S*/g, word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
)

const updateById = (parent, child) => {
  return {
    ...parent,
    [child.id]: child
  }
}

const updateByKeys = (object, keys, callback) => {
  const subset = keys.reduce((map, key) => {
    const value = object[key]
    map[key] = mergeRight(value, callback(value))
    return map
  }, {})
  return mergeRight(object, subset)
}

module.exports = {
  splitValues,
  findGroup,
  isAnyMatch,
  getSlackChannelTags,
  getSlackChannel,
  getSlackUserTags,
  getSlackUser,
  makeTitleCase,
  slackUserTag,
  updateById,
  updateByKeys
}
