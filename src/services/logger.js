// logger.js
const winston = require('winston');
const moment = require("moment-timezone");

moment.tz.setDefault('America/Argentina/Buenos_Aires')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format((info) => {
      info.timestamp = moment().format(); 
      return info;
    })(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'application.log' }), // Registro general de la aplicación
    new winston.transports.File({ filename: 'errores.log', level: 'error' }), // Registro de errores
  ],
});

module.exports = logger;


