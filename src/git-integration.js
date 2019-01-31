const _axios = require('axios')
const https = require('https')

const { readState } = require('./bot-state')
const log = require('./utils/log')

const axios = _axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

const getStagingInfo = async () => {
  const { stagingInfoUrl } = await readState()
  try {
    const { data } = await axios.get(stagingInfoUrl)
    return data
  } catch (err) {
    log.error('getStagingInfo()', err)
    return {}
  }
}

const getProductionInfo = async () => {
  const { productionInfoUrl } = await readState()
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
