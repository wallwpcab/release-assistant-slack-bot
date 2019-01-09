const { splitValues } = require('./utils');

const getRequestData = (dialogData, user) => {
  const { requestType: type, commits: _commits, description, approval, subscribers: _subscribers } = dialogData;
  const commits = splitValues(_commits)
  const subscribers = splitValues(_subscribers || '')
  const id = Date.now();

  return {
    id,
    type,
    commits,
    subscribers,
    description,
    approval,
    user
  }
}

const getConfigData = ({ config }) => {
  return JSON.parse(config)
}

module.exports = {
  getRequestData,
  getConfigData
}
