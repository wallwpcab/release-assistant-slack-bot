require('../../test-utils/mock-implementations')
const { configPost } = require('./controller')
const { getSlackChannel } = require('../../utils')
const { waitForInternalPromises, toggleLogger } = require('../../test-utils')
const { readState, updateState } = require('../../bot-state')
const { configReadView } = require('./views')
const { mockDialogOpenApi } = require('../../test-utils/mock-api')

describe('Config controller', async () => {
  it('Can handle read config', async () => {
    const req = {
      body: {
        text: ''
      }
    }

    const res = {
      send: jest.fn()
    }

    await updateState({ test: 'test' }, true)
    await configPost(req, res)
    await waitForInternalPromises()

    const config = await readState()
    expect(res.send).toBeCalledWith(configReadView(config))
  })

  it('Can handle update config', async () => {
    const botChannel = '<#GEL8D0QRG|release-bot-test>'
    const deployChannel = '<#CEML3BEK0|release-bot>'
    const req = {
      body: {
        text: `--update --botChannel ${botChannel} --deployChannel ${deployChannel}`
      }
    }

    const res = {
      send: jest.fn()
    }

    const api = mockDialogOpenApi(({ dialog }) => {
      const [{ value }] = JSON.parse(dialog).elements
      const config = JSON.parse(value)
      expect(config).toEqual({
        botChannel: getSlackChannel(botChannel),
        deployChannel: getSlackChannel(deployChannel)
      })
      return true
    })

    await updateState({}, true)
    await configPost(req, res)
    await waitForInternalPromises()

    expect(api.isDone()).toBe(true)
  })

  it('Can handle update config internal error', async () => {
    const req = {
      body: {
        text: null
      }
    }

    const res = {
      send: jest.fn(),
      sendStatus: jest.fn()
    }

    toggleLogger()
    await configPost(req, res)
    await waitForInternalPromises()
    toggleLogger()

    expect(res.sendStatus).toBeCalledWith(500)
  })
})
