require('../../test-utils/mock-implementations')
const { configPost } = require('./controller')
const { waitForInternalPromises } = require('../../test-utils')
const { readConfig, updateConfig } = require('../../bot-config')
const { configReadView, branchBuildView, stagingBuildView, productionBuildView } = require('./views')
const { mockConfig } = require('../../test-utils/mock-data')
const { mockDialogOpenApi, mockPostMessageApi } = require('../../test-utils/mock-api')

describe('Config controller', async () => {
  it('Can handle read config', async () => {
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

  it('Can handle update config', async () => {
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

  it('Can handle update config internal error', async () => {
    const req = {
      body: {
        text: null
      }
    }

    const res = {
      send: jest.fn(),
      sendStatus: jest.fn()
    }

    await configPost(req, res)
    await waitForInternalPromises()

    expect(res.sendStatus).toBeCalledWith(500)
  })

  it('Can handle test branch build', async () => {
    const req = {
      body: {
        text: '--testBranchBuild --branch release/hotfix/20134455'
      }
    }

    const res = {
      send: jest.fn()
    }

    const messageApi = mockPostMessageApi(
      mockConfig.botChannelWebhook,
      ({ attachments }) => {
        expect(attachments).toEqual(branchBuildView('release/hotfix/20134455').attachments)
        return true
      }
    )

    await updateConfig(mockConfig)
    await configPost(req, res)
    await waitForInternalPromises()

    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle test staging build', async () => {
    const req = {
      body: {
        text: '--testStagingBuild --branch release/hotfix/20134456'
      }
    }

    const res = {
      send: jest.fn()
    }

    const messageApi = mockPostMessageApi(
      mockConfig.botChannelWebhook,
      ({ attachments }) => {
        expect(attachments).toEqual(stagingBuildView('release/hotfix/20134456').attachments)
        return true
      }
    )

    await updateConfig(mockConfig)
    await configPost(req, res)
    await waitForInternalPromises()

    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle test production build', async () => {
    const req = {
      body: {
        text: '--testProductionBuild --branch release/hotfix/20134457'
      }
    }

    const res = {
      send: jest.fn()
    }

    const messageApi = mockPostMessageApi(
      mockConfig.botChannelWebhook,
      ({ attachments }) => {
        expect(attachments).toEqual(productionBuildView('release/hotfix/20134457').attachments)
        return true
      }
    )

    await updateConfig(mockConfig)
    await configPost(req, res)
    await waitForInternalPromises()

    expect(messageApi.isDone()).toBe(true)
  })
})
