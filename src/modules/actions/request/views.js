const { RequestApproval } = require('../../request/mappings')
const { requestIdLabel } = require('../../request/views')
const { slackUserTag } = require('../../../utils')
const { getRequests } = require('../request/utils')
const {
  requestDetailsLabel,
  requestTypeLabel,
  gitCheckoutLabel,
  gitCherryPickLabel,
  requestCommitsLabel
} = require('./labels')

const requestReceivedAuthorView = ({ id, type, commits, permalink }) => ({
  response_type: 'ephemeral',
  text: `We've got your ${requestTypeLabel(type)} request with following commits: ${requestCommitsLabel(commits)}\nYour request id is: ${requestIdLabel({ id, permalink })}.`,
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

const requestReceivedChannelView = ({ user, type }) => `${slackUserTag(user)} requested following ${requestTypeLabel(type)} request.`

const requestLabels = requests => requests.map(request => requestIdLabel(request)).join(', ')

const requestInitiatedManagerView = (deployment, requests, approver) => {
  const deploymentRequests = getRequests(deployment.requests, requests)

  return {
    text: `${slackUserTag(approver)} initiated ${requestLabels(deploymentRequests)} requests.
Please follow these steps:
\`\`\`
# Checkout the new brance from 'Production'
${gitCheckoutLabel(deployment)}

# Cherry pick
${gitCherryPickLabel(deploymentRequests)}

# Push
git push origin HEAD
\`\`\``
  }
}

const requestInitiatedChannelView = (request, approver) => {
  const { user } = request
  return {
    text: `${slackUserTag(approver)} initiated this request.\n//cc ${slackUserTag(user)}`
  }
}

const requestRejectedManagerView = (request, rejector) => {
  const { id, type, permalink } = request
  return {
    text: `${slackUserTag(rejector)} \`rejected\` ${requestIdLabel({ id, permalink })} ${requestTypeLabel(type)} request.`
  }
}

const requestRejectedChannelView = (request, rejector) => {
  const { user } = request
  return {
    text: `${slackUserTag(rejector)} \`rejected\` this request.\n//cc ${slackUserTag(user)}`
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
