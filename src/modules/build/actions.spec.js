require('../../test-utils/mock-implementations')
const { BuildEvent } = require('./mappings')
const { updateState } = require('../../bot-state')
const { waitForInternalPromises } = require('../../test-utils')
const { mockMessageApi, mockEphemeralMessageApi } = require('../../test-utils/mock-api')
const {
  handleIfStagingBuildConfirmAction,
  handleIfStagingBuildIncorrectAction
} = require('./actions')
const {
  buildConfirmedAuthorView,
  buildConfirmedManagerView,
  buildConfirmedChannelView,
  buildIncorrectAuthorView,
  buildIncorrectManagerView,
  buildIncorrectChannelView
} = require('./action-views')
const {
  mockUser,
  mockState,
  mockStagingBuild,
  mockStagingDeployment,
  mockApprovedRequest
} = require('../../test-utils/mock-data')


describe('Build event actions', async () => {
  beforeAll(async () => {
    await updateState({
      ...mockState,
      requests: {
        [mockApprovedRequest.id]: mockApprovedRequest
      },
      deployments: {
        [mockStagingDeployment.id]: mockStagingDeployment
      }
    }, true)
  })

  it('Can handle staging build confirmation action', async () => {
    const name = {
      depId: mockStagingDeployment.id,
      reqId: mockApprovedRequest.id
    }

    const payload = {
      callback_id: BuildEvent.staging.callback_id,
      actions: [
        {
          name: JSON.stringify(name),
          value: BuildEvent.staging.confirmed
        }
      ],
      user: mockUser
    }

    const messageApiCallback = ({ text }) => {
      expect([
        buildConfirmedManagerView(mockStagingBuild, mockApprovedRequest, mockUser).text,
        buildConfirmedChannelView(mockStagingBuild, mockApprovedRequest, mockUser).text
      ]).toContain(text)
      return true
    }

    /* mock api */
    const ephemeralMessageApi = mockEphemeralMessageApi(({ text }) => {
      expect(text).toBe(
        buildConfirmedAuthorView(mockStagingBuild, mockApprovedRequest).text
      )
      return true
    })

    const userMessageApi = mockMessageApi(messageApiCallback)
    const channelMessageApi = mockMessageApi(messageApiCallback)
    /* mock api */

    // simulate controller method call
    await handleIfStagingBuildConfirmAction(payload)
    await waitForInternalPromises()

    // should call following api
    expect(ephemeralMessageApi.isDone()).toBe(true)
    expect(userMessageApi.isDone()).toBe(true)
    expect(channelMessageApi.isDone()).toBe(true)
  })

  it('Can handle staging build incorrect action', async () => {
    const name = {
      depId: mockStagingDeployment.id,
      reqId: mockApprovedRequest.id
    }

    const payload = {
      callback_id: BuildEvent.staging.callback_id,
      actions: [
        {
          name: JSON.stringify(name),
          value: BuildEvent.staging.incorrect
        }
      ],
      user: mockUser
    }

    const messageApiCallback = ({ text }) => {
      expect([
        buildIncorrectManagerView(mockStagingBuild, mockApprovedRequest, mockUser).text,
        buildIncorrectChannelView(mockStagingBuild, mockApprovedRequest, mockUser).text
      ]).toContain(text)
      return true
    }

    /* mock api */
    const ephemeralMessageApi = mockEphemeralMessageApi(({ text }) => {
      expect(text).toBe(
        buildIncorrectAuthorView(mockStagingBuild, mockApprovedRequest).text
      )
      return true
    })

    const userMessageApi = mockMessageApi(messageApiCallback)
    const channelMessageApi = mockMessageApi(messageApiCallback)
    /* mock api */

    // simulate controller method call
    await handleIfStagingBuildIncorrectAction(payload)
    await waitForInternalPromises()

    // should call following api
    expect(ephemeralMessageApi.isDone()).toBe(true)
    expect(userMessageApi.isDone()).toBe(true)
    expect(channelMessageApi.isDone()).toBe(true)
  })
})
