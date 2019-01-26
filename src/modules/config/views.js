const { Config } = require('./mappings')

const configReadView = (config) => ({
  response_type: 'ephemeral',
  text: `Config: \`\`\`${JSON.stringify(config, null, 2)}\`\`\``,
  mrkdwn: true,
  mrkdwn_in: ['text'],
})

const configDialogView = (value) => ({
  title: 'Set config',
  callback_id: Config.callback_id,
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

const branchBuildView = branch => ({
  attachments: [
    {
      color: '#36a64f',
      text: `[*LIVE*] Deployed <https://google.com|*${branch}*> (auth: glass/Glass-Passw0rd) version \`c03012d\`.`
    },
    {
      color: '#36a64f',
      text: 'Click <https://google.com|*here*> to promote `c03012d` to `staging` environment.'
    }
  ]
})

const stagingBuildView = branch => ({
  attachments: [
    {
      color: '#36a64f',
      text: `[*LIVE*] Deployed *staging* (auth: glass/Glass-Passw0rd) version \`c03012d\`.
Build <https://google.com|#232> status is: *SUCCESS*. test results / artifacts / commits / changelog`
    },
    {
      color: '#36a64f',
      text: `\`\`\`c03012d - (HEAD, origin/${branch}) DCDP-2550 Fix page template selector (2019-01-23T10:36:56+02:00) <Ivan Savchenko>
ca36897 - DCDP-2550 Fix cms endpont path (2019-01-23T11:04:17+02:00) <Ivan Savchenko>
abe3173 - CART-1198 Revert Cart Overlay rollout of DE, GB, FR, NL (2019-01-22T16:59:41+01:00) <Boyle, Molly>\`\`\``
    },
    {
      color: '#36a64f',
      text: 'Click <https://google.com|*here*> to promote `c03012d` to `production` environment. <https://google.com|deployment plan>'
    }
  ]
})

const productionBuildView = branch => ({
  attachments: [
    {
      color: '#36a64f',
      text: `[*LIVE*] Deployed *production* (auth: glass/Glass-Passw0rd) version \`c03012d\`.
Build <https://google.com|#106> status is: *SUCCESS*. test results / artifacts / commits / changelog`
    },
    {
      color: '#36a64f',
      text: `\`\`\`c03012d - (HEAD, tag: staging-20190123-c03012d, origin/${branch}) DCDP-2550 Fix page template selector (2019-01-23T10:36:56+02:00) <Ivan Savchenko>
ca36897 - DCDP-2550 Fix cms endpont path (2019-01-23T11:04:17+02:00) <Ivan Savchenko>
abe3173 - CART-1198 Revert Cart Overlay rollout of DE, GB, FR, NL (2019-01-22T16:59:41+01:00) <Boyle, Molly>\`\`\``
    }
  ]
})

module.exports = {
  configReadView,
  configDialogView,
  branchBuildView,
  stagingBuildView,
  productionBuildView
}
