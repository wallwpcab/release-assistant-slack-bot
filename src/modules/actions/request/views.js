const { RequestApproval } = require('../../request/mappings')
const { requestIdLabel } = require('../../request/views')
const {
  requestLabel,
  typeLabel,
  gitCheckoutLabel,
  gitCherryPickLabel,
  subscribersLabel,
  commitsLabel,
  usersLabel
} = require('./labels')

const requestReceivedAuthorView = ({ id, type, commits, subscribers, file }) => ({
  response_type: 'ephemeral',
  text: `I've received your ${typeLabel(type)} request with following commits: ${commitsLabel(commits)} Your request id is: ${requestIdLabel(id, file)}.\nI'll notify ${usersLabel(subscribers)} about further updates.`,
  mrkdwn: true,
  mrkdwn_in: ['text'],
})

const requestReceivedManagerView = (request) => {
  const { callback_id, approve, reject } = RequestApproval
  return {
    text: `You've got following release request.\n ${requestLabel(request)}`,
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
    text: `<@${approver.id}> initiated your ${requestIdLabel(id, file)} release request.  :tada:`
  }
}

const requestInitiatedManagerView = (request, deployment, approver) => {
  const { id, type, file } = request

  return {
    text: `<@${approver.id}> initiated ${requestIdLabel(id, file)} request.
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
  const { id, file, user, subscribers } = request
  return {
    text: `<@${approver.id}> initiated ${requestIdLabel(id, file)} release request of <@${user.id}>.  :tada:
${subscribersLabel(subscribers)}
`
  }
}

const requestInitiatedCommentView = (approver) => {
  return `<@${approver.id}> initiated this release request.  :tada:`
}

const requestRejectedAuthorView = (request, rejector) => {
  const { id, file } = request
  return {
    text: `<@${rejector.id}> rejected your ${requestIdLabel(id, file)} request.`
  }
}

const requestRejectedManagerView = (request, rejector) => {
  const { id, file } = request
  return {
    text: `<@${rejector.id}> rejected ${requestIdLabel(id, file)} request.`
  }
}

const requestRejectedCommentView = (rejector) => {
  return `<@${rejector.id}> rejected this release request.`
}

module.exports = {
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
