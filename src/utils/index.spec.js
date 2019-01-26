const {
  splitValues,
  getSlackChannels,
  getSlackChannelId,
  getSlackUsers,
  getSlackUserId,
  hasBranchDeployed,
  getDeploymentEnv
} = require('./index')

describe('Utils', () => {
  it('Can split text by white space or comma seperator', () => {
    expect(splitValues('123 456 \n 6778 , 5666, , 90')).toEqual(['123', '456', '6778', '5666', '90'])
  })

  it('Can extract Slack channels from text', () => {
    expect(getSlackChannels('bla bla <#CHANNEL1> <#CHANNEL2|channel2>, bla <#CHANNEL3|channel3> test')).toEqual(['<#CHANNEL1>', '<#CHANNEL2|channel2>', '<#CHANNEL3|channel3>'])
  })

  it('Can extract Slack channel id from text', () => {
    expect(getSlackChannelId('bla bla <#CHANNEL1>')).toEqual('CHANNEL1')
  })

  it('Can extract Slack users from text', () => {
    expect(getSlackUsers('bla bla <@USER1> <@USER2|user2>, bla <@USER3|user3> test')).toEqual(['<@USER1>', '<@USER2|user2>', '<@USER3|user3>'])
  })

  it('Can extract Slack userId from text', () => {
    expect(getSlackUserId('bla bla <@USER1> abc')).toEqual('USER1')
  })

  it('Can detect if a branch deployment occured from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = `[*LIVE*] Deployed <https://google.com|*${branch}*> (auth: glass/Glass-Passw0rd) version \`c03012d\`.
Click <https://google.com|*here*> to promote \`c03012d\` to \`staging\` environment.`

    expect(hasBranchDeployed(branch, message)).toBe(true)
  })

  it('Can extract branch from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = `[*LIVE*] Deployed <https://google.com|*${branch}*> (auth: glass/Glass-Passw0rd) version \`c03012d\`.
Click <https://google.com|*here*> to promote \`c03012d\` to \`staging\` environment.`

    expect(hasBranchDeployed(branch, message)).toBe(true)
    expect(getDeploymentEnv(branch, message)).toBe('branch')
  })

  it('Can detect if a staging deployment occured from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = `[*LIVE*] Deployed *staging* (auth: glass/Glass-Passw0rd) version \`c03012d\`.
Build #232 status is: *SUCCESS*. test results / artifacts / commits / changelog
\`\`\`c03012d - (HEAD, origin/${branch}) DCDP-2550 Fix page template selector (2019-01-23T10:36:56+02:00) <Ivan Savchenko>
ca36897 - DCDP-2550 Fix cms endpont path (2019-01-23T11:04:17+02:00) <Ivan Savchenko>
abe3173 - CART-1198 Revert Cart Overlay rollout of DE, GB, FR, NL (2019-01-22T16:59:41+01:00) <Boyle, Molly>\`\`\`
Click <https://google.com|*here*> to promote \`c03012d\` to \`production\` environment. <https://google.com|deployment plan>`

    expect(hasBranchDeployed(branch, message)).toBe(true)
    expect(getDeploymentEnv(branch, message)).toBe('staging')
  })

  it('Can detect if a production deployment occured from event message', () => {
    const branch = 'release/hotfix/2013434435'
    const message = `[*LIVE*] Deployed *production* (auth: glass/Glass-Passw0rd) version \`c03012d\`.
Build #106 status is: *SUCCESS*. test results / artifacts / commits / changelog
\`\`\`c03012d - (HEAD, tag: staging-20190123-c03012d, origin/${branch}) DCDP-2550 Fix page template selector (2019-01-23T10:36:56+02:00) <Ivan Savchenko>
ca36897 - DCDP-2550 Fix cms endpont path (2019-01-23T11:04:17+02:00) <Ivan Savchenko>
abe3173 - CART-1198 Revert Cart Overlay rollout of DE, GB, FR, NL (2019-01-22T16:59:41+01:00) <Boyle, Molly>\`\`\``

    expect(hasBranchDeployed(branch, message)).toBe(true)
    expect(getDeploymentEnv(branch, message)).toBe('production')
  })
})
