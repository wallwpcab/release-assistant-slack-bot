const { requestIdLabel } = require('../request/labels')
const { slackUserTag } = require('../../utils')

const requestCanceledManagerView = (request, user) => {
  return {
    text: `${slackUserTag(user)} canceled ${requestIdLabel(request)} progress`
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
