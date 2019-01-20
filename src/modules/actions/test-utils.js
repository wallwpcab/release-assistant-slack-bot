const generateActionRequest = (callback_id, user) => (name, value) => ({
  body: {
    payload: JSON.stringify({
      type: 'interactive_message',
      callback_id,
      actions: [{
        name,
        value
      }],
      user
    })
  }
})

const generateDialogRequest = (response_url, user) => (callback_id, submission) => ({
  body: {
    payload: JSON.stringify({
      type: 'dialog_submission',
      callback_id,
      response_url,
      submission,
      user
    })
  }
})

module.exports = {
  generateActionRequest,
  generateDialogRequest
}
