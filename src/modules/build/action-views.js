const {
  slackUserTag
} = require('../../utils')
const {
  requestIdLabel
} = require('../request/labels')

const buildLabel = build => `<${build.infoLink}|*#${build.id}*>`

const buildConfirmedAuthorView = (build, request) => ({
  text: `You've confirmed ${requestIdLabel(request)} is in Staging ${buildLabel(build)}. :white_check_mark:`,
  unfurl_links: false
})

const buildConfirmedManagerView = (build, request, user) => ({
  text: `Dear *Release Manager*
${slackUserTag(user)} confirmed :white_check_mark: ${requestIdLabel(request)} in Staging ${buildLabel(build)}`,
  unfurl_links: false
})

const buildConfirmedChannelView = (build, request, user) => ({
  text: `${slackUserTag(user)} confirmed :white_check_mark: ${requestIdLabel(request)} in Staging ${buildLabel(build)}`,
  unfurl_links: false
})

const buildIncorrectAuthorView = (build, request) => ({
  text: `You've marked ${requestIdLabel(request)} as incorrect in Staging ${buildLabel(build)}. :no_entry:`,
  unfurl_links: false
})

const buildIncorrectManagerView = (build, request, user) => ({
  text: `Dear *Release Manager*
${slackUserTag(user)} marked ${requestIdLabel(request)} as incorrect :no_entry: in Staging ${buildLabel(build)}`,
  unfurl_links: false
})

const buildIncorrectChannelView = (build, user) => ({
  text: `${slackUserTag(user)} marked this request as incorrect :no_entry: in Staging ${buildLabel(build)}`,
  unfurl_links: false
})

module.exports = {
  buildLabel,
  buildConfirmedAuthorView,
  buildConfirmedManagerView,
  buildConfirmedChannelView,
  buildIncorrectAuthorView,
  buildIncorrectManagerView,
  buildIncorrectChannelView
}
