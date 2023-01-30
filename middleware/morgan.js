const morgan = require("morgan");
const logger = require("../lib/logger");

const stream = {
  
  write: (message) => logger.http(message),
};


const morganMiddleware = morgan(
  
  "METHOD: :method URL: :url STATUS: :status TIME: :response-time ms",
  
  {stream}
);

module.exports = morganMiddleware;