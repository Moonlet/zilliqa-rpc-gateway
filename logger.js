// const bunyan = require("bunyan");
// const PrettyStream = require("bunyan-prettystream");

// const prettyStream = new PrettyStream();
// prettyStream.pipe(process.stdout);
function timestamp() {
  return ',"timestamp":"' + new Date().toISOString() + '"';
}

let config;
let pino;
let logger;

const Log = {
  getDefaultConfig(name, level) {
    // return {
    //   name,
    //   streams: [
    //     {
    //       level,
    //       stream: prettyStream,
    //     },
    //   ],
    // };
  },
  configure(conf) {
    config = conf;
    pino = require("pino")({
      timestamp,
      prettyPrint: config.prettyPrint,
    });
    logger = pino.child({
      name: config.name,
      level: config.level,
    });
  },
  getLogger() {
    return logger;
  },
  getChildLogger(conf) {
    return pino.child(Object.assign({}, config, conf));
  },

  fatal(...args) {
    logger && logger.fatal(...args);
  },
  error(...args) {
    logger && logger.error(...args);
  },
  warn(...args) {
    logger && logger.warn(...args);
  },
  info(...args) {
    logger && logger.info(...args);
  },
  debug(...args) {
    logger && logger.debug(...args);
  },
  trace(...args) {
    logger && logger.trace(...args);
  },
};

module.exports = Log;
