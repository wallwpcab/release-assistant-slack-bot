const minimist = require('minimist')

const { showProgressView, confirmRequestCancelView } = require('./views')
const { RequestStatus } = require('../request/mappings')
const { requestInvalidIdView, requestAlreadyInitiatedView } = require('../request/views')
const { readConfig } = require('../../bot-config')
const { splitValues } = require('../../utils')
const log = require('../../utils/log')

const progressPost = async (req, res) => {
  const { text } = req.body
  const args = minimist(splitValues(text))

  handleIfViewProgress(args, res)
  handleIfCancelProgress(args, res)
}

const handleIfViewProgress = async (args, res) => {
  if (args.cancel) return

  const { id } = args
  const { requests } = await readConfig()

  if(!id) {
    const requestArray = Object.values(requests).map(v => v)
    res.send(showProgressView(requestArray))
    return
  }

  if(requests[id]) {
    res.send(showProgressView([requests[id]]))
    return
  }

  res.send(requestInvalidIdView(id))
  log.info('handleIfViewProgress() error')
}

const handleIfCancelProgress = async (args, res) => {
  if (!args.cancel) return

  const { id } = args
  const { requests } = await readConfig()

  if(!requests[id]) {
    res.send(requestInvalidIdView(id))
    return
  }

  const request = requests[id]
  if(request.status !== RequestStatus.initial) {
    res.send(requestAlreadyInitiatedView(request))
    return
  }

  res.send(confirmRequestCancelView(request))
}

module.exports = {
  progressPost
}
