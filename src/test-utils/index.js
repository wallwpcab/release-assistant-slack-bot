const tracer = require('tracer')

const waitForInternalPromise = () => new Promise(resolve => setTimeout(resolve, 50))

const waitForInternalPromises = async (times = 3) => {
  for (let i = 0; i < times; i++) {
    await waitForInternalPromise()
  }
}

const showLog = true
const logLevel = tracer.getLevel()
const toggleLogger = () => {
  if (showLog) tracer.close()
  else tracer.setLevel(logLevel)
}

const expressHelper = (body) => {
  const req = {
    body
  }

  const res = {
    send: jest.fn(),
    sendStatus: jest.fn()
  }

  return {
    req,
    res,
    args: [req, res]
  }
}

module.exports = {
  waitForInternalPromises,
  toggleLogger,
  expressHelper
}
