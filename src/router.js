const { Router } = require('express')

const { actionsPost } = require('./modules/actions/controller')
const { configPost } = require('./modules/config/controller')
const { eventsPost } = require('./modules/events/controller')
const { progressPost } = require('./modules/progress/controller')
const { requestPost } = require('./modules/request/controller')

const router = Router()

router.post('/slack/actions', actionsPost)
router.post('/slack/command/config', configPost)
router.post('/slack/events', eventsPost)
router.post('/slack/command/progress', progressPost)
router.post('/slack/command/request', requestPost)

module.exports = router
