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
  buildIncorrectAuthorView,
  buildIncorrectManagerView
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
      user: mockUser,
    }

    /** mock api **/
    const ephemeralMessageApi = mockEphemeralMessageApi(({ text }) => {
      expect(text).toBe(
        buildConfirmedAuthorView(mockStagingBuild, mockApprovedRequest).text
      )
      return true
    })

    const messageApi = mockMessageApi(
      ({ text }) => {
        expect(text).toBe(
          buildConfirmedManagerView(
            mockStagingBuild,
            mockApprovedRequest,
            mockUser
          ).text
        )
        return true
      }
    )
    /** mock api **/

    // simulate controller method call
    await handleIfStagingBuildConfirmAction(payload)
    await waitForInternalPromises()

    // should call following api
    expect(ephemeralMessageApi.isDone()).toBe(true)
    expect(messageApi.isDone()).toBe(true)
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
      user: mockUser,
    }

    /** mock api **/
    const ephemeralMessageApi = mockEphemeralMessageApi(({ text }) => {
      expect(text).toBe(
        buildIncorrectAuthorView(mockStagingBuild, mockApprovedRequest).text
      )
      return true
    })

    const messageApi = mockMessageApi(
      ({ text }) => {
        expect(text).toBe(
          buildIncorrectManagerView(mockStagingBuild, mockApprovedRequest, mockUser).text
        )
        return true
      }
    )
    /** mock api **/

    // simulate controller method call
    await handleIfStagingBuildIncorrectAction(payload)
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
    expect(ephemeralMessageApi.isDone()).toBe(true)
  })
})
