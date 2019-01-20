jest.mock('../persistence')
jest.mock('../modules/slack/http')
const { mockSlackApiUrl } = require('./config.mock')

module.exports = {
  mockSlackApiUrl
}
