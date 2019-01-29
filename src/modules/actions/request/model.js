class Deployment {
  constructor({ id, status, baseCommit, build, requests }) {
    this.id = id
    this.status = status
    this.baseCommit = baseCommit
    this.build = build
    this.requests = requests
  }

  compact() {
    return {
      id: this.id,
      status: this.status,
      baseCommit: this.baseCommit,
      build: this.build,
      requests: this.requests.map(({ id }) => id)
    }
  }
}

module.exports = {
  Deployment
}
