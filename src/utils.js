const morgan = require('morgan');
const tracer = require('tracer');
const { split, reject, map } = require('ramda');

const log = (() => {
  const logger = tracer.colorConsole();
  logger.requestLogger = morgan('dev');
  return logger;
})();

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (Number.isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

const delay = time => new Promise((resolve) => {
  setTimeout(() => { resolve(); }, time);
});

const writeToCsv = ({ headers, records, filePath }) => {
  // const writer = csvWriter({ headers });
  // writer.pipe(fs.createWriteStream(filePath));
  // records.forEach(r => writer.write(r));
  // writer.end();
  console.log(headers, records, filePath);
};

const splitValues = (str, sep = /[\s+,]/) => reject(
  s => !s,
  map(
    s => s.trim(),
    split(sep, str)
  )
)

const extractSlackChannels = (text) => {
  const channelExpr = /<#([^>]+)/g;
  const matches = text.match(channelExpr) || [];
  return matches.map(i => `${i}>`)
}

const extractSlackChannelId = (text) => {
  const channelExpr = /<#([^|>]+)/g;
  const [match] = text.match(channelExpr) || [''];
  return match.replace('<#', '');
}

const extractSlackUsers = (text) => {
  const userExpr = /<@([^>]+)/g;
  const matches = text.match(userExpr) || [];
  return matches.map(i => `${i}>`)
}

const extractSlackUserId = (text) => {
  const userExpr = /<@([^>]+)/g;
  const [match] = text.match(userExpr) || [''];
  return match.replace('<@', '');
}

module.exports = {
  log,
  normalizePort,
  delay,
  writeToCsv,
  splitValues,
  extractSlackChannels,
  extractSlackChannelId,
  extractSlackUsers,
  extractSlackUserId
};
