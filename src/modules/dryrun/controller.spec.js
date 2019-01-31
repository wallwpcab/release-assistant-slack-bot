require('../../test-utils/mock-implementations')
const { dryrunPost } = require('./controller')
const { waitForInternalPromises } = require('../../test-utils')
const { updateState } = require('../../bot-state')
const { branchBuildView, stagingBuildView, productionBuildView } = require('./views')
const { mockState } = require('../../test-utils/mock-data')
const { mockMessageApi } = require('../../test-utils/mock-api')

describe('Dryrun controller', async () => {
  it('Can handle test branch build', async () => {
    const req = {
      body: {
        text: '--branchBuild -b release/hotfix/20134455'
      }
    }

    const res = {
      send: jest.fn()
    }

    const messageApi = mockMessageApi(({ attachments }) => {
      expect(attachments).toEqual(branchBuildView('release/hotfix/20134455').attachments)
      return true
    })

    await updateState(mockState)
    await dryrunPost(req, res)
    await waitForInternalPromises()

    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle test staging build', async () => {
    const req = {
      body: {
        text: '--stagingBuild -b release/hotfix/20134456'
      }
    }

    const res = {
      send: jest.fn()
    }

    const messageApi = mockMessageApi(
      ({ attachments }) => {
        expect(attachments).toEqual(stagingBuildView('release/hotfix/20134456').attachments)
        return true
      }
    )

    await updateState(mockState)
    await dryrunPost(req, res)
    await waitForInternalPromises()

    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle test production build', async () => {
    const req = {
      body: {
        text: '--productionBuild -b release/hotfix/20134457'
      }
    }

    const res = {
      send: jest.fn()
    }

    const messageApi = mockMessageApi(
      ({ attachments }) => {
        expect(attachments).toEqual(productionBuildView('release/hotfix/20134457').attachments)
        return true
      }
    )

    await updateState(mockState)
    await dryrunPost(req, res)
    await waitForInternalPromises()

    expect(messageApi.isDone()).toBe(true)
  })
})
