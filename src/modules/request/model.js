const { is, mergeRight, path } = require('ramda')

class Deployment {
  constructor({ id, status, baseCommit, build, requests }) {
    this.update({ id, status, baseCommit, build, requests })
  }

  update(props) {
    const { id, status, baseCommit, build, requests } = mergeRight(this, props)
    this.id = id
    this.status = status
    this.baseCommit = baseCommit
    this.build = build
    this.requests = requests
  }

  isExpanded() {
    const [request] = this.requests
    return is(Object, request)
  }

  export() {
    const requests = this.isExpanded() ? this.requests.map(({ id }) => id) : this.requests
    return {
      id: this.id,
      status: this.status,
      baseCommit: this.baseCommit,
      build: this.build,
      requests
    }
  }

  mapRequests(requests) {
    if(this.isExpanded()) return
    this.requests = this.requests.map((id) => requests[id])
  }

  getRequestThread() {
    if (!this.requests.length === 1) {
      return null
    }
    const [request] = this.requests
    return this.isExpanded() ? request.file.thread_ts : null
  }
}

module.exports = {
  Deployment
}
