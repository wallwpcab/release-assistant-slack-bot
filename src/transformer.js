const { format } = require('date-fns')

const { splitValues, makeTitleCase } = require('./utils')
const { generateId, getDate } = require('./utils/generator')

const getRequestData = (dialogData, user) => {
  const { requestType: type, commits, description, approval } = dialogData

  return {
    id: generateId(),
    type,
    commits: splitValues(commits),
    description,
    approval,
    date: getDate(),
    user
  }
}

const getConfigData = ({ config }) => {
  return JSON.parse(config)
}

const getFileContent = (request) => {
  const { id, type, commits, description, approval, date, user } = request
  const approvalText = {
    ['yes']: 'Yes',
    ['no']: 'No',
  }

  return `Id			: ${id}
Type		: ${makeTitleCase(type)}
Commits		: [ ${commits.join(', ')} ]
Description	: ${description}
Approval	: ${approvalText[approval] || 'Unknown'}
Date		: ${format(date, 'MM.DD.YY / HH:mm')}
User Name	: ${user.name}
User Id		: ${user.id}`
}

module.exports = {
  getRequestData,
  getConfigData,
  getFileContent
}
