const { slackUserTag } = require('../../../utils')
const { requestIdLabel } = require('../../request/views')

const buildConfirmedAuthorView = (build, request) => {
  return {
    text: `You've confirmed ${requestIdLabel(request)} is in Staging *#${build.id}*. :white_check_mark:`
  }
}

const buildConfirmedManagerView = (build, request, user) => {
  return {
    text: `${slackUserTag(user)} confirmed :white_check_mark: ${requestIdLabel(request)} in Staging *#${build.id}*`
  }
}

const buildIncorrectAuthorView = (build, request) => {
  return {
    text: `You've marked ${requestIdLabel(request)} as incorrect in Staging *#${build.id}*. :no_entry:`
  }
}

const buildIncorrectManagerView = (build, request, user) => {
  return {
    text: `${slackUserTag(user)} marked ${requestIdLabel(request)} as incorrect :no_entry: in Staging *#${build.id}*`
  }
}

module.exports = {
  buildConfirmedAuthorView,
  buildConfirmedManagerView,
  buildIncorrectAuthorView,
  buildIncorrectManagerView
}
