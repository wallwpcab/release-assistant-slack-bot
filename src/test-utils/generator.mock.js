jest.mock('../utils/generator')
const { generateId } = require('../utils/generator')

let mockId = '-'
generateId.mockImplementation(() => mockId)

const setMockId = id => mockId = id

module.exports = {
  setMockId
}
