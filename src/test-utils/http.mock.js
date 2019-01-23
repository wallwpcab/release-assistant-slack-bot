jest.mock('../modules/slack/http')
const axios = require('axios')
const config = require('config')

const { httpClient } = require('../modules/slack/http')

httpClient.mockImplementation(() => {
  const { apiUrl } = config.get('slack')
  const agent = axios.create({
    baseURL: apiUrl
  })
  return agent
})
