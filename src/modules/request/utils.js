const getUnprocessedRequests = (requests)=> {
  return Object.values(requests).filter(r => r.status === 'initial')
}

module.exports = {
  getUnprocessedRequests
}
