require('../../test-utils/mock-implementations')
const { configPost } = require('./controller')
const { waitForInternalPromises } = require('../../test-utils')
const { readConfig, updateConfig } = require('../../bot-config')
const { configReadView } = require('./views')
const { mockDialogOpenApi } = require('../../test-utils/mock-api')

describe('Config controller', async () => {
  it('can handle read config', async () => {
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

  it('can handle update config', async () => {
    const req = {
      body: {
        text: '--update --deployChannel #deploy --botChannel #bot-channel'
      }
    }
    const res = {
      send: jest.fn()
    }

    const api = mockDialogOpenApi(({ dialog }) => {
      const [{ value }] = JSON.parse(dialog).elements
      expect(JSON.parse(value)).toMatchObject({
        deployChannel: '#deploy',
        botChannel: '#bot-channel'
      })
      return true
    })

    await updateConfig({}, true)
    await configPost(req, res)
    await waitForInternalPromises()

    expect(api.isDone()).toBe(true)
  })
})
