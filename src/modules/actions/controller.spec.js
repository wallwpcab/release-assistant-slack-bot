require('../../test-utils/mock-implementations')
const { postActions } = require('./controller')
const { requestMapping } = require('../request/mappings')
const { mcokHotfixRequest, mockUser } = require('../../test-utils/mock-data')
const { readConfig } = require('../../bot-config')

describe('Actions controller', async () => {
  it('can handle dialog action', async () => {
    const req = {
      body: {
        payload: JSON.stringify({
          type: 'dialog_submission',
          callback_id: requestMapping.callback_id,
          submission: mcokHotfixRequest,
          user: mockUser
        })
      }
    }

    const res = {
      send: jest.fn()
    }

    console.log(await readConfig())
    await postActions(req, res)
    console.log(await readConfig())
  })
})
