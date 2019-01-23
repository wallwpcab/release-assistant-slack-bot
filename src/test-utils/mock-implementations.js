const { mockSlackApiUrl } = require('./config.mock')
require('./generator.mock')
require('./persistence.mock')
require('./http.mock')

module.exports = {
  mockSlackApiUrl
}
