const bodyParser = require('body-parser')

const { isTrusted } = require('./modules/slack/verification')
const log = require('./utils/log')
const router = require('./router')

const rawBodyBuffer = (req, _, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8')
  }
}

const slackGuard = (req, res, next) => {
  if (!isTrusted(req)) {
    log.error('Verification token mismatch')
    res.sendStatus(404)
  }
  next()
}

function bootstrap(app) {
  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }))
  app.use(bodyParser.json({ verify: rawBodyBuffer }))
  app.use(slackGuard)

  // register route
  router.forEach(r => app.use(r))

  // 404
  app.use((_, res) => {
    res.status(404).send({
      status: 404,
      message: 'The requested resource was not found'
    })
  })

  // 5xx
  app.use((err, _, res) => {
    log.error(err.stack)
    const message = process.env.NODE_ENV === 'production'
      ? 'Something went wrong, we\'re looking into it...'
      : err.stack
    res.status(500).send({
      status: 500,
      message
    })
  })
}

module.exports = bootstrap
