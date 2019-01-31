require('../../../test-utils/mock-implementations')
const { handleIfEditDialogAction } = require('./actions')
const { Config } = require('../../config/mappings')
const { configReadView } = require('../../config/views')
const { mockUser, mockState } = require('../../../test-utils/mock-data')
const { readState, updateState } = require('../../../bot-state')
const { waitForInternalPromises } = require('../../../test-utils')
const { mockPublicMessageApi } = require('../../../test-utils/mock-api')

const responseUrl = 'http://response.slack.com/message'

describe('Config actions', async () => {
  beforeAll(async () => {
    await updateState(mockState, true)
  })

  it('Can handle edit config dialog action', async () => {
    const payload = {
      response_url: responseUrl,
      user: mockUser,
      callback_id: Config.callback_id,
      submission: {
        state: JSON.stringify(mockState)
      }
    }

    /** mock api **/
    const messageApi = mockPublicMessageApi(responseUrl, ({ text }) => {
      expect(text).toBe(configReadView(mockState).text)
      return true
    }
    )

    // reset config
    await updateState({}, true)

    // simulate
    await handleIfEditDialogAction(payload)
    await waitForInternalPromises()
    const config = await readState()

    // should call following api
    expect(messageApi.isDone()).toBe(true)

    // config should be updated
    expect(config).toEqual(mockState)
  })
})
