const { Router } = require('express')

const eventsRouter = require('./modules/events/router')
const progressRouter = require('./modules/progress/router')
const requestRouter = require('./modules/request/router')

const { actionsPost } = require('./modules/actions/controller')
const { configPost } = require('./modules/config/controller')

const router = Router()

router.post('/slack/actions', actionsPost)
router.post('/slack/command/config', configPost)

module.exports = [
  router,
  eventsRouter,
  progressRouter,
  requestRouter
]
