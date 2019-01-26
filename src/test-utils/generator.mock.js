jest.mock('../utils/generator');

const { generateId } = require('../utils/generator');

generateId.mockImplementation(() => 'id-1');
