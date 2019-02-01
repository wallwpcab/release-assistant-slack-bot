const { actionsPost } = require('./controller')
const { waitForInternalPromises, toggleLogger, expressHelper } = require('../../test-utils')

describe('Actions controller', async () => {
  it('Can handle invalid payload', async () => {
    const http = expressHelper({
      payload: 'invalid-payload'
    })

    toggleLogger()
    await actionsPost(...http.args)
    await waitForInternalPromises()
    toggleLogger()

    expect(http.res.send).toBeCalled()
  })
})
