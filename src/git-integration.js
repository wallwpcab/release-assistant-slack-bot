const _axios = require('axios')
const https = require('https')

const { readConfig } = require('./bot-config')
const log = require('./utils/log')

const axios = _axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

const getStagingInfo = async () => {
  const { stagingInfoUrl } = await readConfig()
  try {
    const { data } = await axios.get(stagingInfoUrl)
    return data
  } catch (err) {
    log.error('getStagingInfo()', err)
    return {}
  }
}

const getProductionInfo = async () => {
  const { productionInfoUrl } = await readConfig()
  try {
    const { data } = await axios.get(productionInfoUrl)
    return data
  } catch (err) {
    log.error('getProductionInfo()', err)
    return {}
  }
}

const getGitInfo = (production) => {
  if(production) {
    return getProductionInfo()
  } else {
    return getStagingInfo()
  }
}

module.exports = {
  getGitInfo,
  getStagingInfo,
  getProductionInfo
}
