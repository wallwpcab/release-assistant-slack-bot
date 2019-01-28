const { RequestApproval } = require('../../request/mappings')
const { requestIdLabel } = require('../../request/views')
const { slackUser } = require('../../../utils')
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

const requestReceivedFileCommentView = ({ user, type }) => `${slackUser(user)} requested following ${requestTypeLabel(type)} request.`

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

const requestInitiatedAuthorView = (request, approver) => {
  const { id, file } = request
  return {
    text: `${slackUser(approver)} initiated your ${requestIdLabel(id, file)} release request.  :tada:`
  }
}

const requestInitiatedManagerView = (request, deployment, approver) => {
  const { id, type, file } = request

  return {
    text: `${slackUser(approver)} initiated ${requestIdLabel(id, file)} request.
Please follow these steps:
\`\`\`
# Checkout the new brance from ${type === 'activation' ? 'Staging' : 'Production'}
${gitCheckoutLabel(deployment)}

# Cherry pick
${gitCherryPickLabel(deployment)}

# Push
git push origin HEAD
\`\`\``
  }
}

const requestInitiatedChannelView = (request, approver) => {
  const { id, file, user, type } = request
  return {
    text: `${slackUser(approver)} initiated ${slackUser(user)}'s ${requestIdLabel(id, file)} ${requestTypeLabel(type)} request.`
  }
}

const requestInitiatedCommentView = (approver) => {
  return `${slackUser(approver)} initiated this release request.  :tada:`
}

const requestRejectedAuthorView = (request, rejector) => {
  const { id, file } = request
  return {
    text: `${slackUser(rejector)} rejected your ${requestIdLabel(id, file)} request.`
  }
}

const requestRejectedManagerView = (request, rejector) => {
  const { id, file } = request
  return {
    text: `${slackUser(rejector)} rejected ${requestIdLabel(id, file)} request.`
  }
}

const requestRejectedCommentView = (rejector) => {
  return `${slackUser(rejector)} rejected this release request.`
}

module.exports = {
  requestReceivedFileCommentView,
  requestReceivedAuthorView,
  requestReceivedManagerView,
  requestInitiatedAuthorView,
  requestInitiatedManagerView,
  requestInitiatedChannelView,
  requestInitiatedCommentView,
  requestRejectedAuthorView,
  requestRejectedManagerView,
  requestRejectedCommentView
}
