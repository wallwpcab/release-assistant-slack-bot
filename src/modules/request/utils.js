const { RequestStatus } = require('./mappings')

const getInitialRequests = (requests)=> {
  return Object.values(requests).filter(r => r.status === RequestStatus.initial)
}

module.exports = {
  getInitialRequests
}
