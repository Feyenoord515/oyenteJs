// errorHandling.js
const logger = require('../services/logger');

function errorHandler(err, req, res, next) {
  if (err) {
    logger.error('Error no manejado:', err);
    res.status(500).json({ error: 'Ha ocurrido un error inesperado.' });
  } else {
    next();
  }
}

module.exports = errorHandler;


  
  