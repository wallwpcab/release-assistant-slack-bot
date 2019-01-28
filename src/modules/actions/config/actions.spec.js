require('../../../test-utils/mock-implementations')
const { actionsPost } = require('../controller')
const { Config } = require('../../config/mappings')
const { configReadView } = require('../../config/views')
const { mockUser, mockConfig } = require('../../../test-utils/mock-data')
const { readConfig, updateConfig } = require('../../../bot-config')
const { waitForInternalPromises } = require('../../../test-utils')
const { generateDialogRequest } = require('../test-utils')
const { mockPublicMessageApi } = require('../../../test-utils/mock-api')

const responseUrl = 'http://response.slack.com/message'
const dialogRequest = generateDialogRequest(responseUrl, mockUser)

describe('Dialog actions', async () => {
  beforeAll(async () => {
    await updateConfig(mockConfig, true)
  })

  it('Can handle edit config dialog action', async () => {
    const req = dialogRequest(
      Config.callback_id,
      {
        config: JSON.stringify(mockConfig)
      }
    )

    const res = {
      send: jest.fn()
    }

    /** mock api **/
    const messageApi = mockPublicMessageApi(
      responseUrl,
      ({ text }) => {
        expect(text).toBe(configReadView(mockConfig).text)
        return true
      }
    )

    // reset config
    await updateConfig({}, true)

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()
    const config = await readConfig()

    // should call following api
    expect(messageApi.isDone()).toBe(true)

    // config should be updated
    expect(config).toEqual(mockConfig)
  })
})
