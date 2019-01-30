const { actionsPost } = require('./controller')
const { waitForInternalPromises, toggleLogger } = require('../../test-utils')

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

    toggleLogger()
    await actionsPost(req, res)
    await waitForInternalPromises()
    toggleLogger()

    expect(res.send).toBeCalled()
  })
})
