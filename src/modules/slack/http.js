const axios = require('axios')
const config = require('config')
const { once } = require('ramda')

const httpClient = () => once(() => {
  const { apiUrl, bot } = config.get('slack')
  const agent = axios.create({
    baseURL: apiUrl
  })
  agent.defaults.headers.common['Authorization'] = 'Bearer ' + bot.token
  return agent
})

module.exports = {
  httpClient
}
