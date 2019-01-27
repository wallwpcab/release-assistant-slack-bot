const { mockSlackApiUrl } = require('./config.mock')
const { setMockId } = require('./generator.mock')
require('./persistence.mock')
require('./http.mock')

module.exports = {
  mockSlackApiUrl,
  setMockId
}
