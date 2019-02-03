const {
  format
} = require('date-fns')

const {
  splitValues,
  makeTitleCase
} = require('./utils')
const {
  generateId,
  getDate
} = require('./utils/generator')

const getRequestData = (dialogData, user) => {
  const {
    requestType: type,
    commits,
    description,
    approval
  } = dialogData

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

const getConfigData = ({
  state
}) => JSON.parse(state)

const getApprovalText = (approval) => {
  const approvalText = {
    yes: 'Yes',
    no: 'No'
  }
  return approvalText[approval] || 'Unknown'
}

const getFileContent = (request) => {
  const {
    id,
    type,
    commits,
    description,
    approval,
    date
  } = request

  return `Id      : ${id}
Type    : ${makeTitleCase(type)}
Commits    : [${commits.join(', ')}]
Description  : ${description}
Approval  : ${getApprovalText(approval)}
Date    : ${format(date, 'MM.DD.YY / HH:mm')}`
}

module.exports = {
  getRequestData,
  getConfigData,
  getFileContent,
  getApprovalText
}
