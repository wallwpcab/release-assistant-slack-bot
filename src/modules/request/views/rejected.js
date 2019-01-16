const { requestIdLabel } = require('./labels')

const requestRejectedAuthorView = (requestData, rejector) => {
  const { id, fileLink } = requestData
  return {
    text: `<@${rejector.id}> rejected your ${requestIdLabel(id, fileLink)} request.`
  }
}

const requestRejectedManagerView = (requestData, rejector) => {
  const { id, fileLink } = requestData
  return {
    text: `<@${rejector.id}> rejected ${requestIdLabel(id, fileLink)} request.`
  }
}

const requestRejectedCommentView = (rejector) => {
  return `<@${rejector.id}> rejected this release request.`
}

module.exports = {
  requestRejectedAuthorView,
  requestRejectedManagerView,
  requestRejectedCommentView
}
