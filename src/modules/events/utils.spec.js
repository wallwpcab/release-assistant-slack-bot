const { hasBranchDeployed, getDeploymentEnv } = require('./utils')

describe('Events Utils', () => {
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
