const configRouter = require('./modules/config/router');
const requestRouter = require('./modules/request/router');
const actionsRouter = require('./modules/actions/router');
const eventsRouter = require('./modules/events/router');

module.exports = [
  configRouter,
  requestRouter,
  actionsRouter,
  eventsRouter
];
