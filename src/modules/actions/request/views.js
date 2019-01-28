const { RequestApproval } = require('../../request/mappings')
const { requestIdLabel } = require('../../request/views')
const { slackUser } = require('../../../utils')
const { getRequests } = require('../request/utils')
const {
  requestDetailsLabel,
  requestTypeLabel,
  gitCheckoutLabel,
  gitCherryPickLabel,
  requestCommitsLabel
} = require('./labels')

const requestReceivedAuthorView = ({ id, type, commits, file }) => ({
  response_type: 'ephemeral',
  text: `We've got your ${requestTypeLabel(type)} request with following commits: ${requestCommitsLabel(commits)}\nYour request id is: ${requestIdLabel(id, file)}.`,
  mrkdwn: true,
  mrkdwn_in: ['text'],
})

const requestReceivedManagerView = (request) => {
  const { callback_id, approve, reject } = RequestApproval
  return {
    text: `You've got following release request.\n ${requestDetailsLabel(request)}`,
    attachments: [
      {
        text: "Do you like to proceed?",
        fallback: "You've got a release request. Please check.",
        callback_id,
        color: "#3AA3E3",
        attachment_type: "default",
        actions: [
          {
            name: approve,
            text: "Yes",
            type: "button",
            style: "primary",
            value: request.id
          },
          {
            name: reject,
            text: "No",
            type: "button",
            style: "danger",
            value: request.id,
            confirm: {
              title: "Are you sure?",
              text: "Wouldn't you like to proceed?",
              ok_text: "Yes",
              dismiss_text: "No"
            }
          }
        ]
      }
    ]
  }
}

const requestReceivedChannelView = ({ user, type }) => `${slackUser(user)} requested following ${requestTypeLabel(type)} request.`

const requestLabels = requests => requests.map(({ id, file }) => requestIdLabel(id, file)).join(', ')

const requestInitiatedManagerView = (deployment, allRequests, approver) => {
  const requests = getRequests(deployment.requests, allRequests)

  return {
    text: `${slackUser(approver)} initiated ${requestLabels(requests)} requests.
Please follow these steps:
\`\`\`
# Checkout the new brance from 'Production'
${gitCheckoutLabel(deployment)}

# Cherry pick
${gitCherryPickLabel(deployment)}

# Push
git push origin HEAD
\`\`\``
  }
}

const requestInitiatedChannelView = (request, approver) => {
  const { user, type } = request
  return {
    text: `${slackUser(approver)} initiated ${slackUser(user)}'s ${requestTypeLabel(type)} request.`
  }
}

const requestRejectedManagerView = (request, rejector) => {
  const { id, type, file } = request
  return {
    text: `${slackUser(rejector)} rejected ${requestIdLabel(id, file)} ${requestTypeLabel(type)} request.`
  }
}

const requestRejectedChannelView = (request, rejector) => {
  const { user, type } = request
  return {
    text: `${slackUser(rejector)} rejected ${slackUser(user)}'s ${requestTypeLabel(type)} request.`
  }
}

module.exports = {
  requestReceivedAuthorView,
  requestReceivedManagerView,
  requestReceivedChannelView,
  requestInitiatedManagerView,
  requestInitiatedChannelView,
  requestRejectedManagerView,
  requestRejectedChannelView
}
