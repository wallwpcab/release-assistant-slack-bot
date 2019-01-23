const { splitValues } = require('./utils')
const { generateId } = require('./utils/generator')

const getRequestData = (dialogData, user) => {
  const { requestType: type, commits: commitsStr, description, approval, subscribers: subscribersStr } = dialogData
  const commits = splitValues(commitsStr)
  const subscribers = splitValues(subscribersStr || '')
  const id = generateId()

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
