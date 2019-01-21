const { Router } = require('express')

const progressRouter = require('./modules/progress/router')
const requestRouter = require('./modules/request/router')

const { actionsPost } = require('./modules/actions/controller')
const { configPost } = require('./modules/config/controller')
const { eventsPost } = require('./modules/events/controller')

const router = Router()

router.post('/slack/actions', actionsPost)
router.post('/slack/command/config', configPost)
router.post('/slack/events', eventsPost)

module.exports = [
  router,
  progressRouter,
  requestRouter
]
