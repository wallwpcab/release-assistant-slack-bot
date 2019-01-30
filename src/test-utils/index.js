const tracer = require('tracer')

const waitForInternalPromise = () => new Promise(resolve => setTimeout(resolve, 50))

const waitForInternalPromises = async (times = 3) => {
  for (let i = 0; i < times; i++) {
    await waitForInternalPromise()
  }
}

let showLog = true
let logLevel = tracer.getLevel()
const toggleLogger = () => {
  if(showLog)
    tracer.close()
  else
    tracer.setLevel(logLevel)
}

module.exports = {
  waitForInternalPromises,
  toggleLogger
}
