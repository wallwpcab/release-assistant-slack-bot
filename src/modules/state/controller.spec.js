require('../../test-utils/mock-implementations')
const { statePost } = require('./controller')
const { getSlackChannel } = require('../../utils')
const { waitForInternalPromises, toggleLogger, expressHelper } = require('../../test-utils')
const { readState, updateState } = require('../../bot-state')
const { stateReadView } = require('./views')
const { mockDialogOpenApi } = require('../../test-utils/mock-api')

describe('Config controller', async () => {
  it('Can handle read config', async () => {
    const http = expressHelper({
      text: ''
    })

    await updateState({ test: 'test' }, true)
    await statePost(...http.args)
    await waitForInternalPromises()

    const state = await readState()
    expect(http.res.send).toBeCalledWith(stateReadView(state))
  })

  it('Can handle update config', async () => {
    const releaseChannel = '<#GEL8D0QRG|release-bot-test>'
    const deployChannel = '<#CEML3BEK0|release-bot>'
    const http = expressHelper({
      text: `--update --releaseChannel ${releaseChannel} --deployChannel ${deployChannel}`
    })

    const api = mockDialogOpenApi(({ dialog }) => {
      const [{ value }] = JSON.parse(dialog).elements
      const config = JSON.parse(value)
      expect(config).toEqual({
        config: {
          releaseChannel: getSlackChannel(releaseChannel),
          deployChannel: getSlackChannel(deployChannel)
        }
      })
      return true
    })

    await updateState({}, true)
    await statePost(...http.args)
    await waitForInternalPromises()

    expect(api.isDone()).toBe(true)
  })

  it('Can handle update config internal error', async () => {
    const http = expressHelper({
      text: null
    })

    toggleLogger()
    await statePost(...http.args)
    await waitForInternalPromises()
    toggleLogger()

    expect(http.res.sendStatus).toBeCalledWith(500)
  })
})
