require('./test-utils/mock-implementations')
const { readConfig, updateConfig } = require('./bot-config')

describe('Bot Config', () => {
  it('Can read the config', async () => {
    expect(await readConfig()).toEqual({})
  })

  it('Can update the config', async () => {
    expect(await updateConfig({ test: 'test' })).toEqual({ test: 'test' })
  })

  it('Can partially update the config', async () => {
    expect(await updateConfig({ test2: 'test2' })).toEqual({ test: 'test', test2: 'test2' })
  })

  it('Can overrite the config', async () => {
    expect(await updateConfig({ test3: 'test3' }, true)).toEqual({ test3: 'test3' })
  })
})
