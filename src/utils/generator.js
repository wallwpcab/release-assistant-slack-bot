const generateId = () => Date.now().toString(36)

const getDate = () => new Date().toISOString()

module.exports = {
  generateId,
  getDate
}
