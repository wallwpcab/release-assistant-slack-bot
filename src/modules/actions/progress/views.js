const { requestIdLabel } = require('../../request/views')
const { slackUser } = require('../../../utils')

const requestCanceledManagerView = ({ id, file }, user) => {
  return {
    text: `${slackUser(user)} canceled ${requestIdLabel(id, file)} progress`
  }
}

const requestCanceledChannelView = (user) => {
  return {
    text: `${slackUser(user)} canceled this request`
  }
}

module.exports = {
  requestCanceledManagerView,
  requestCanceledChannelView
}
