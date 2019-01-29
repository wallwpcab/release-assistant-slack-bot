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

  compact() {
    const [request] = this.requests
    const requests = is(Object, request) ? this.requests.map(({ id }) => id) : this.requests
    return {
      id: this.id,
      status: this.status,
      baseCommit: this.baseCommit,
      build: this.build,
      requests
    }
  }

  expand(requests) {
    this.requests = this.requests.map((id) => requests[id])
  }

  getRequestThread() {
    if (!this.requests.length === 1) {
      return null
    }
    const [request] = this.requests
    return is(Object, request) ? request.file.thread_ts : null
  }
}

module.exports = {
  Deployment
}
