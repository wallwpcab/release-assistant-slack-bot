const config = require('config');
const express = require('express');

const bootstrap = require('./bootstrap');
const log = require('./utils/log');

const app = express();
const port = config.get('port');

bootstrap(app);
const server = app.listen(port);

server.on('error', (error) => {
  log.error(`Failed to start server: ${error}`);
  process.exit(1);
});

server.on('listening', () => {
  log.info(`Server listening ${port}`);
});

module.exports = app;
