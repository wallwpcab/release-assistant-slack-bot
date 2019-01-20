jest.mock('config')
const config = require('config')
const { path, mergeDeepRight, reject } = require('ramda')

const defaultConfig = require('../../config/default.json')
let newConfig = defaultConfig

config.get.mockImplementation((setting = '') => {
  const paths = setting.split('.')
  return path(reject(p => !p, paths), newConfig)
})

const mockSlackApiUrl = () => {
  newConfig = mergeDeepRight(defaultConfig, {
    slack: {
      apiUrl: `${defaultConfig.slack.apiUrl}/${Date.now()}`
    }
  })
}

module.exports = {
  mockSlackApiUrl
}
