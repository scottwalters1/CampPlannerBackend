const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf((info) => {
      return `${info.timestamp} [${info.level}]: ${info.message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "backendLog.log" }), 
  ],
});

function loggerMiddleware(req, res, next) {
  logger.info(`Incoming ${req.method} : ${req.url}`);
  next();
}

module.exports = { logger, loggerMiddleware };
