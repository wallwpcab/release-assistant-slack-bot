const { actionsPost } = require('./controller')
const { waitForInternalPromises } = require('../../test-utils')

describe('Actions controller', async () => {
  it('Can handle invalid payload', async () => {
    const req = {
      body: {
        payload: 'invalid-payload'
      }
    }

    const res = {
      send: jest.fn()
    }

    await actionsPost(req, res)
    await waitForInternalPromises()

    expect(res.send).toBeCalled()
  })
})
