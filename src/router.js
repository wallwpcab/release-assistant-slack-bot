const { Router } = require('express')

// const actionsRouter = require('./modules/actions/router')
const configRouter = require('./modules/config/router')
const eventsRouter = require('./modules/events/router')
const progressRouter = require('./modules/progress/router')
const requestRouter = require('./modules/request/router')

const { postActions } = require('./modules/actions/controller')

const router = Router()

router.post('/slack/actions', postActions)

module.exports = [
  router,
  configRouter,
  eventsRouter,
  progressRouter,
  requestRouter
]
