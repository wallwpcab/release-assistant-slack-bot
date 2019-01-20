require('./test-utils/mock-implementations')
const { readConfig, updateConfig } = require('./bot-config')

describe('Bot Config', () => {
  beforeEach(async () => {
    await updateConfig({}, true)
  })

  it('Can read the config', async () => {
    expect(await readConfig()).toEqual({})
  })

  it('Can update the config', async () => {
    await updateConfig({ test: 'test' })
    expect(await readConfig()).toEqual({ test: 'test' })
  })

  it('Can update and read the updated config', async () => {
    const updatedConfig = await updateConfig({ test: 'test' })
    expect(updatedConfig).toEqual({ test: 'test' })
  })

  it('Can partially update the config', async () => {
    await updateConfig({ test1: 'test1' })
    await updateConfig({ test2: 'test2' })
    expect(await readConfig()).toEqual({ test1: 'test1', test2: 'test2' })
  })

  it('Can update nested property', async () => {
    await updateConfig({
      test: {
        a: 'a'
      }
    })
    await updateConfig({
      test: {
        b: 'b'
      }
    })
    expect(await readConfig()).toEqual({
      test: {
        a: 'a',
        b: 'b'
      }
    })
  })

  it('Can overrite the config', async () => {
    await updateConfig({test: 'test'})
    await updateConfig({}, true)
    expect(await readConfig()).toEqual({})
  })
})
