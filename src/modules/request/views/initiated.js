const { requestIdLabel, gitCheckoutLabel, gitCherryPickLabel, subscribersLabel } = require('./labels')

const requestInitiatedAuthorView = (requestData, approver) => {
  const { id, file } = requestData
  return {
    text: `<@${approver.id}> initiated your ${requestIdLabel(id, file)} release request.  :tada:`
  }
}

const requestInitiatedManagerView = (requests, requestData, approver) => {
  const { id, type, file } = requestData
  return {
    text: `<@${approver.id}> initiated ${requestIdLabel(id, file)} request.
Please follow these steps:
\`\`\`
# Checkout the new brance from ${type === 'activation' ? 'Staging' : 'Production'}
${gitCheckoutLabel(requestData)}

# Cherry pick
${gitCherryPickLabel(requests)}

# Push
git push origin HEAD
\`\`\``
  }
}

const requestInitiatedChannelView = (requestData, approver) => {
  const { id, file, user, subscribers } = requestData
  return {
    text: `<@${approver.id}> initiated ${requestIdLabel(id, file)} release request of <@${user.id}>.  :tada:
${subscribersLabel(subscribers)}
`
  }
}

const requestInitiatedCommentView = (approver) => {
  return `<@${approver.id}> initiated this release request.  :tada:`
}


module.exports = {
  requestInitiatedAuthorView,
  requestInitiatedManagerView,
  requestInitiatedChannelView,
  requestInitiatedCommentView
}
