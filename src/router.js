const { Router } = require('express')

const { actionsPost } = require('./modules/actions/controller')
const { configPost } = require('./modules/config/controller')
const { eventsPost } = require('./modules/events/controller')
const { progressPost } = require('./modules/progress/controller')
const { requestPost } = require('./modules/request/controller')
const { dryrunPost } = require('./modules/dryrun/controller')
const { reportPost } = require('./modules/report/controller')

const router = Router()

router.post('/slack/actions', actionsPost)
router.post('/slack/command/config', configPost)
router.post('/slack/events', eventsPost)
router.post('/slack/command/progress', progressPost)
router.post('/slack/command/request', requestPost)
router.post('/slack/command/dryrun', dryrunPost)
router.post('/slack/command/report', reportPost)

module.exports = router
