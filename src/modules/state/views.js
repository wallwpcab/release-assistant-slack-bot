const { Config } = require('./mappings')

const configReadView = (state) => ({
  response_type: 'ephemeral',
  text: `State: \`\`\`${JSON.stringify(state, null, 2)}\`\`\``,
  mrkdwn: true,
  mrkdwn_in: ['text'],
})

const configDialogView = (value) => ({
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
  configReadView,
  configDialogView
}
