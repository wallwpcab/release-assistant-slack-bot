const { requestIdLabel } = require('./labels')

const requestRejectedAuthorView = (requestData, rejector) => {
  const { id, file } = requestData
  return {
    text: `<@${rejector.id}> rejected your ${requestIdLabel(id, file)} request.`
  }
}

const requestRejectedManagerView = (requestData, rejector) => {
  const { id, file } = requestData
  return {
    text: `<@${rejector.id}> rejected ${requestIdLabel(id, file)} request.`
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
