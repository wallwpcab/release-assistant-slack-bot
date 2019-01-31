const { slackUserTag } = require('../../../utils')
const { requestIdLabel } = require('../../request/views')

const buildLabel = build => `#<${build.infoLink}|*${build.id}*>`

const buildConfirmedAuthorView = (build, request) => {
  return {
    text: `You've confirmed ${requestIdLabel(request)} is in Staging ${buildLabel(build)}. :white_check_mark:`
  }
}

const buildConfirmedManagerView = (build, request, user) => {
  return {
    text: `${slackUserTag(user)} confirmed :white_check_mark: ${requestIdLabel(request)} in Staging #${buildLabel(build)}`
  }
}

const buildIncorrectAuthorView = (build, request) => {
  return {
    text: `You've marked ${requestIdLabel(request)} as incorrect in Staging ${buildLabel(build)}. :no_entry:`
  }
}

const buildIncorrectManagerView = (build, request, user) => {
  return {
    text: `${slackUserTag(user)} marked ${requestIdLabel(request)} as incorrect :no_entry: in Staging ${buildLabel(build)}`
  }
}

module.exports = {
  buildLabel,
  buildConfirmedAuthorView,
  buildConfirmedManagerView,
  buildIncorrectAuthorView,
  buildIncorrectManagerView
}
