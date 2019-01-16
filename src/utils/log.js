const morgan = require('morgan')
const tracer = require('tracer')

const getLevel = (env) => {
  switch(env) {
    case 'development': return 'log'
    case 'production': return 'error'
    case 'test':
    default: return Number.MAX_VALUE
  }
}

const log = (() => {
  const env = process.env.NODE_ENV
  const logger = tracer.colorConsole({
    level: getLevel(env)
  })
  logger.requestLogger = morgan(env)
  return logger
})()

module.exports = log
