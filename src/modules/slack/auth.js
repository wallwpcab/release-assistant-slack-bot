const config = require('config')

const slackConfig = config.get('slack')

const setAuthHeader = (agent) => {
  agent.defaults.headers.common['Authorization'] = 'Bearer ' + slackConfig.bot.token
}

module.exports = {
  setAuthHeader
}
