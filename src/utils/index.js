const { split, reject, map } = require('ramda');

const splitValues = (str, sep = /[\s+,]/) => reject(
  s => !s,
  map(
    s => s.trim(),
    split(sep, str)
  )
)

const extractSlackChannels = (text) => {
  const channelExpr = /<#([^>]+)/g;
  const matches = text.match(channelExpr) || [];
  return matches.map(i => `${i}>`)
}

const extractSlackChannelId = (text) => {
  const channelExpr = /<#([^|>]+)/g;
  const [match] = text.match(channelExpr) || [''];
  return match.replace('<#', '');
}

const extractSlackUsers = (text) => {
  const userExpr = /<@([^>]+)/g;
  const matches = text.match(userExpr) || [];
  return matches.map(i => `${i}>`)
}

const extractSlackUserId = (text) => {
  const userExpr = /<@([^>]+)/g;
  const [match] = text.match(userExpr) || [''];
  return match.replace('<@', '');
}

module.exports = {
  splitValues,
  extractSlackChannels,
  extractSlackChannelId,
  extractSlackUsers,
  extractSlackUserId
};
