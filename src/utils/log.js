const morgan = require('morgan');
const tracer = require('tracer');

const log = (() => {
  const logger = tracer.colorConsole();
  logger.requestLogger = morgan('dev');
  return logger;
})();

module.exports = log;
