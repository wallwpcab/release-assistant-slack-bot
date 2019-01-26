jest.mock('../persistence');
const { readStore, writeStore } = require('../persistence');

let store = {};
readStore.mockImplementation(() => store);
writeStore.mockImplementation((value) => {
  store = value;
  return store;
});
