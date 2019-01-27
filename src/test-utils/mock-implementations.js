const { mockSlackApiUrl } = require('./config.mock')
const { setMockId, setMockDate } = require('./generator.mock')
require('./persistence.mock')
require('./http.mock')

module.exports = {
  mockSlackApiUrl,
  setMockId,
  setMockDate
}
