require('../../test-utils/mock-implementations')
const { configPost } = require('./controller')
const { getSlackChannel } = require('../../utils')
const { waitForInternalPromises } = require('../../test-utils')
const { readConfig, updateConfig } = require('../../bot-config')
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

    await updateConfig({ test: 'test' }, true)
    await configPost(req, res)
    await waitForInternalPromises()

    const config = await readConfig()
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

    await updateConfig({}, true)
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

    await configPost(req, res)
    await waitForInternalPromises()

    expect(res.sendStatus).toBeCalledWith(500)
  })
})
