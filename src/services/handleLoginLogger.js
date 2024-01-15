// handleLoginLogger.js
const winston = require('winston');
const moment = require("moment-timezone");

moment.tz.setDefault('America/Argentina/Buenos_Aires')

const handleLoginLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format((info) => {
      info.timestamp = moment().format(); // Utiliza el formato de timestamp de moment
      return info;
    })(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'handleLogin.log' }),
  ],
});

module.exports = handleLoginLogger;
