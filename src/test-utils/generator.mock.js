jest.mock('../utils/generator')
const { generateId, getDate } = require('../utils/generator')

let mockId = '-'
generateId.mockImplementation(() => mockId)

const setMockId = (id) => {
  mockId = id
}

let mockDate = new Date().toISOString()
getDate.mockImplementation(() => mockDate)

const setMockDate = (date) => {
  mockDate = date
}

module.exports = {
  setMockId,
  setMockDate
}
