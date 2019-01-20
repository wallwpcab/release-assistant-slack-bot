const axios = require('axios')
const config = require('config')

const httpClient = () => {
  const { apiUrl } = config.get('slack')
  const agent = axios.create({
    baseURL: apiUrl
  })
  return agent
}

module.exports = {
  httpClient
}
