const morgan = require('morgan')
const tracer = require('tracer')

const env = process.env.NODE_ENV
const logger = tracer.colorConsole({
  level: env === 'production' ? 'error' : 'log'
})
logger.requestLogger = morgan('dev')

module.exports = logger
