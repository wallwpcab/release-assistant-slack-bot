const { RequestType, RequestStatus } = require('./mappings')

const getInitialRequests = (requests) => {
  return Object.values(requests).filter(r => r.status === RequestStatus.initial)
}

const getGroupType = (requests) => {
  const hasType = (requests, type) => requests.find(r => r && r.type === type)

  return [
    RequestType.hotfix.value,
    RequestType.activation.value
  ].map(type => hasType(requests, type) && type)
    .filter(Boolean)
    .join('-')
}

module.exports = {
  getInitialRequests,
  getGroupType
}
