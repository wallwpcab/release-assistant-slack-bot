jest.mock('config')
const config = require('config')
const { path, reject } = require('ramda')

const defaultConfig = require('../../config/default.json')

config.get.mockImplementation((setting = '') => {
  const paths = setting.split('.')
  return path(reject(p => !p, paths), defaultConfig)
})
