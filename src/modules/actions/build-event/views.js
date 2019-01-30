const { slackUserTag } = require('../../../utils')
const { requestIdLabel } = require('../../request/views')

const stagingBuildConfirmedReleaseManagerView = (user, request, build) => {
  return {
    text: `${slackUserTag(user)} confirmed :white_check_mark: ${requestIdLabel(request)} in Staging *#${build.id}*`
  }
}

const stagingBuildIncorrectReleaseManagerView = (user, request, build) => {
  return {
    text: `${slackUserTag(user)} marked ${requestIdLabel(request)} as incorrect :no_entry: in Staging *#${build.id}*`
  }
}

module.exports = {
  stagingBuildConfirmedReleaseManagerView,
  stagingBuildIncorrectReleaseManagerView
}
