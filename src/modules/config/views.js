const { configMapping } = require('./mappings')

const configReadView = (config) => ({
  response_type: 'ephemeral',
  text: `Config: \`\`\`${JSON.stringify(config, null, 2)}\`\`\``,
  mrkdwn: true,
  mrkdwn_in: ['text'],
})

const configDialogView = (value) => ({
  title: 'Set config',
  callback_id: configMapping.callback_id,
  submit_label: 'Submit',
  elements: [
    {
      label: 'Config',
      name: 'config',
      type: 'textarea',
      value
    }
  ]
})

module.exports = {
  configReadView,
  configDialogView
}
