jest.mock('../persistence')
jest.mock('../transformer')
jest.mock('../modules/slack/http')
const { mockSlackApiUrl } = require('./config.mock')

module.exports = {
  mockSlackApiUrl
}
