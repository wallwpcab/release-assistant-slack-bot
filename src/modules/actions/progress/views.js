const { requestIdLabel } = require('../../request/views')

const requestCanceledAuthorView = ({ id, file }) => {
  return {
    response_type: 'ephemeral',
    text: `You've canceled ${requestIdLabel(id, file)} request`
  }
}

const requestCanceledManagerView = ({ id, file }, user) => {
  return {
    text: `<@${user.id}> canceled ${requestIdLabel(id, file)} progress`
  }
}

const requestCanceledCommentView = (user) => {
  return `<@${user.id}> canceled progress`
}

module.exports = {
  requestCanceledAuthorView,
  requestCanceledManagerView,
  requestCanceledCommentView
}
