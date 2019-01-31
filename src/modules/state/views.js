const { Config } = require('./mappings')

const stateReadView = (state) => ({
  response_type: 'ephemeral',
  text: `State: \`\`\`${JSON.stringify(state, null, 2)}\`\`\``,
  mrkdwn: true,
  mrkdwn_in: ['text'],
})

const stateDialogView = (value) => ({
  title: 'Set state',
  callback_id: Config.callback_id,
  submit_label: 'Submit',
  elements: [
    {
      label: 'State',
      name: 'state',
      type: 'textarea',
      value
    }
  ]
})

module.exports = {
  stateReadView,
  stateDialogView
}
