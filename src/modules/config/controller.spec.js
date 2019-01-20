require('../../test-utils/mock-implementations')
const { configPost } = require('./controller')
const { waitForInternalPromises } = require('../../test-utils')
const { readConfig, updateConfig } = require('../../bot-config')
const { configReadView } = require('./views')

describe('Config controller', async () => {
  it('can handle read config', async ()=> {
    const req = {
      body: {
        text: ''
      }
    }
    const res = {
      send: jest.fn()
    }

    await updateConfig({test: 'test'})
    await configPost(req, res)
    await waitForInternalPromises()

    const config = await readConfig()
    expect(res.send).toBeCalledWith(configReadView(config))
  })
})
