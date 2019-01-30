require('../../../test-utils/mock-implementations')
const { actionsPost } = require('../controller')
const { DeploymentEvent } = require('../../events/mappings')
const { updateConfig } = require('../../../bot-config')
const { waitForInternalPromises } = require('../../../test-utils')
const { generateActionRequest } = require('../test-utils')
const { mockMessageApi } = require('../../../test-utils/mock-api')
const {
  buildConfirmedManagerView,
  buildIncorrectManagerView
} = require('./views')
const {
  mockUser,
  mockConfig,
  mockStagingBuild,
  mockStagingDeployment,
  mockApprovedRequest
} = require('../../../test-utils/mock-data')

const actionRequest = generateActionRequest(DeploymentEvent.staging.callback_id, mockUser)

describe('Build event actions', async () => {
  beforeAll(async () => {
    await updateConfig({
      ...mockConfig,
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

    const req = actionRequest(JSON.stringify(name), DeploymentEvent.staging.confirmed)

    const res = {
      send: jest.fn()
    }

    /** mock api **/
    const messageApi = mockMessageApi(
      ({ text }) => {
        expect(text).toBe(
          buildConfirmedManagerView(
            mockUser,
            mockApprovedRequest,
            mockStagingBuild
          ).text
        )
        return true
      }
    )

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })

  it('Can handle staging build incorrect action', async () => {
    const name = {
      depId: mockStagingDeployment.id,
      reqId: mockApprovedRequest.id
    }

    const req = actionRequest(JSON.stringify(name), DeploymentEvent.staging.incorrect)

    const res = {
      send: jest.fn()
    }

    /** mock api **/
    const messageApi = mockMessageApi(
      ({ text }) => {
        expect(text).toBe(
          buildIncorrectManagerView(
            mockUser,
            mockApprovedRequest,
            mockStagingBuild
          ).text
        )
        return true
      }
    )

    // simulate controller method call
    await actionsPost(req, res)
    await waitForInternalPromises()

    // should call following api
    expect(messageApi.isDone()).toBe(true)
  })
})
