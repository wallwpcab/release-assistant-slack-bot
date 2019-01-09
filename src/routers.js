const actionsRouter = require('./modules/actions/router');
const configRouter = require('./modules/config/router');
const eventsRouter = require('./modules/events/router');
const progressRouter = require('./modules/progress/router');
const requestRouter = require('./modules/request/router');

module.exports = [
  actionsRouter,
  configRouter,
  eventsRouter,
  progressRouter,
  requestRouter
];
