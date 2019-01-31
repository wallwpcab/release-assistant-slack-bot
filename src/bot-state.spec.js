require('./test-utils/mock-implementations')
const { readState, updateState } = require('./bot-state')

describe('Bot Config', () => {
  beforeEach(async () => {
    await updateState({}, true)
  })

  it('Can read the config', async () => {
    expect(await readState()).toEqual({})
  })

  it('Can update the config', async () => {
    await updateState({ test: 'test' })
    expect(await readState()).toEqual({ test: 'test' })
  })

  it('Can partially update the config', async () => {
    await updateState({ test1: 'test1' })
    await updateState({ test2: 'test2' })
    expect(await readState()).toEqual({ test1: 'test1', test2: 'test2' })
  })

  it('Can update nested property', async () => {
    await updateState({
      test: {
        a: 'a'
      }
    })
    await updateState({
      test: {
        b: 'b'
      }
    })
    expect(await readState()).toEqual({
      test: {
        a: 'a',
        b: 'b'
      }
    })
  })

  it('Can overrite the config', async () => {
    await updateState({test: 'test'})
    await updateState({}, true)
    expect(await readState()).toEqual({})
  })
})
