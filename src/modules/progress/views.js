const { RequestProgress } = require('./mappings')
const { requestIdLabel } = require('../request/views')

const showProgressView = (requests = []) => {
  const progress = requests.map(({ id, permalink, status }) => `Request Id: ${requestIdLabel({ id, permalink })} \nStatus: *\`${status || 'requested'}\`*`).join('\n\n')
  return {
    response_type: 'ephemeral',
    text: progress || 'Progress:\n*`No pending request`*'
  }
}

const confirmRequestCancelView = request => {
  const { callback_id } = RequestProgress
  return {
    response_type: 'ephemeral',
    text: '',
    attachments: [
      {
        text: `Do you like to cancel ${requestIdLabel(request)}?`,
        fallback: "You've got a release request. Please check.",
        callback_id,
        color: "#3AA3E3",
        attachment_type: "default",
        actions: [
          {
            name: request.id,
            text: "Yes",
            type: "button",
            style: "danger",
            value: RequestProgress.cancel,
            confirm: {
              title: "Are you sure?",
              text: "Would you like to cancel?",
              ok_text: "Yes",
              dismiss_text: "No"
            }
          },
          {
            name: request.id,
            text: "No",
            type: "button",
            style: "primary",
            value: 'no',
          }
        ]
      }
    ]
  }
}

module.exports = {
  showProgressView,
  confirmRequestCancelView
}
