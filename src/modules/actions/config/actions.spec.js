require('../../../test-utils/mock-implementations')
const { actionsPost } = require('../controller')
const { Config } = require('../../config/mappings')
const { configReadView } = require('../../config/views')
const { mockUser, mockState } = require('../../../test-utils/mock-data')
const { readState, updateState } = require('../../../bot-state')
const { waitForInternalPromises } = require('../../../test-utils')
const { generateDialogRequest } = require('../test-utils')
const { mockPublicMessageApi } = require('../../../test-utils/mock-api')

const responseUrl = 'http://response.slack.com/message'
const dialogRequest = generateDialogRequest(responseUrl, mockUser)

describe('Config actions', async () => {
  beforeAll(async () => {
    await updateState(mockState, true)
  })

  it('Can handle edit config dialog action', async () => {
    const req = dialogRequest(
      Config.callback_id,
      {
        state: JSON.stringify(mockState)
      }
    )

    const res = {
      send: jest.fn()
    }

    /** mock api **/
    const messageApi = mockPublicMessageApi(
      responseUrl,
      ({ text }) => {
        expect(text).toBe(configReadView(mockState).text)
        return true
      }
    )

    // reset config
    await updateState({}, true)

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()
    const config = await readState()

    // should call following api
    expect(messageApi.isDone()).toBe(true)

    // config should be updated
    expect(config).toEqual(mockState)
  })
})
