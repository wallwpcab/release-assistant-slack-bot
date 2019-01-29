const { requestIdLabel } = require('../../request/views')
const { slackUserTag } = require('../../../utils')

const requestCanceledManagerView = ({ id, file }, user) => {
  return {
    text: `${slackUserTag(user)} canceled ${requestIdLabel(id, file)} progress`
  }
}

const requestCanceledChannelView = (user) => {
  return {
    text: `${slackUserTag(user)} canceled this request`
  }
}

module.exports = {
  requestCanceledManagerView,
  requestCanceledChannelView
}
