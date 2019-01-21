require('../../test-utils/mock-implementations')
const { requestPost } = require('./controller')
const { waitForInternalPromises } = require('../../test-utils')
const { mockDialogOpenApi } = require('../../test-utils/mock-api')
const { requestFormView } = require('../request/views')

describe('Request controller', async () => {
  it('Can open request dialog', async () => {
    const args = '<@USER1|john> <#CHANNEL1|bot-channel>'
    const req = {
      body: {
        text: args,
        trigger_id: 'test-trigger'
      }
    }

    const res = {
      send: jest.fn()
    }

    const api = mockDialogOpenApi(({ dialog }) => {
      expect(dialog).toBe(JSON.stringify(requestFormView(args)))
      return true
    })

    await requestPost(req, res)
    await waitForInternalPromises()

    expect(api.isDone()).toBe(true)
    expect(res.send).toBeCalled()
  })
})
