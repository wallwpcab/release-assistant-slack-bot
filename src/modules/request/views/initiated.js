const { requestIdLabel, gitCheckoutLabel, gitCherryPickLabel, subscribersLabel } = require('./labels')

const requestInitiatedAuthorView = (request, approver) => {
  const { id, file } = request
  return {
    text: `<@${approver.id}> initiated your ${requestIdLabel(id, file)} release request.  :tada:`
  }
}

const requestInitiatedManagerView = (request, requests, approver) => {
  const { id, type, file } = request

  return {
    text: `<@${approver.id}> initiated ${requestIdLabel(id, file)} request.
Please follow these steps:
\`\`\`
# Checkout the new brance from ${type === 'activation' ? 'Staging' : 'Production'}
${gitCheckoutLabel(request)}

# Cherry pick
${gitCherryPickLabel(requests)}

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


module.exports = {
  requestInitiatedAuthorView,
  requestInitiatedManagerView,
  requestInitiatedChannelView,
  requestInitiatedCommentView
}
