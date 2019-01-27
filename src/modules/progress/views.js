const { RequestProgress } = require('./mappings')
const { requestIdLabel } = require('../request/views')

const showProgressView = (requests = []) => {
  const progress = requests.map(({ id, file, progress }) => `Request Id: ${requestIdLabel(id, file)} \nProgress: *\`${progress || 'requested'}\`*`).join('\n\n')
  return {
    response_type: 'ephemeral',
    text: progress || 'Progress:\n*`No pending request`*'
  }
}

const confirmRequestCancelView = ({ id, file }) => {
  const { callback_id, yes, no } = RequestProgress
  return {
    response_type: 'ephemeral',
    text: '',
    attachments: [
      {
        text: `Do you like to cancel ${requestIdLabel(id, file)}?`,
        fallback: "You've got a release request. Please check.",
        callback_id,
        color: "#3AA3E3",
        attachment_type: "default",
        actions: [
          {
            name: no,
            text: "No",
            type: "button",
            style: "primary"
          },
          {
            name: yes,
            text: "Yes",
            type: "button",
            style: "danger",
            value: id,
            confirm: {
              title: "Are you sure?",
              text: "Would you like to cancel?",
              ok_text: "Yes",
              dismiss_text: "No"
            }
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
