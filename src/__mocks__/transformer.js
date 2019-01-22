const { splitValues } = require('../utils')

const getRequestData = (dialogData, user) => {
  const { requestType: type, commits: commitsStr, description, approval, subscribers: subscribersStr = '' } = dialogData
  const commits = splitValues(commitsStr)
  const subscribers = splitValues(subscribersStr)
  const id = 'id-1'

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
