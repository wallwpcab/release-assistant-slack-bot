const { requestIdLabel } = require('./labels')

const requestRejectedAuthorView = (request, rejector) => {
  const { id, file } = request
  return {
    text: `<@${rejector.id}> rejected your ${requestIdLabel(id, file)} request.`
  }
}

const requestRejectedManagerView = (request, rejector) => {
  const { id, file } = request
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
