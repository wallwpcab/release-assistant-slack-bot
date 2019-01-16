const waitForInternalPromise = () =>
  new Promise(resolve => setTimeout(resolve, 0))

const waitForInternalPromises = async (times = 3) => {
  for (let i = 0; i < times; i++) {
    await waitForInternalPromise()
  }
}

module.exports = {
  waitForInternalPromises
}
