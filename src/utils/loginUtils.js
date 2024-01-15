// loginUtils.js
const axios = require('axios');
require('dotenv').config();
const https = require('https');
const handleLoginLogger = require("../services/handleLoginLogger");
const rutaRaiz = process.env.RUTARAIZ;

async function handleLogin(req, res, next, maxRetries = 2) {
  try {
    const { timestamp, SessionId } = req.session;

    if ( isSessionIdExpired(timestamp) || !SessionId ) {
      
      const result = await performLogin(maxRetries);

      if (result.success) {
        req.session.SessionId = result.sessionData.SessionId;
        req.session.timestamp = result.sessionData.timestamp;

       
      } else {
        handleLoginLogger.error('No se pudo iniciar sesión después de varios intentos.');
      }
    } else {
      handleLoginLogger.info('Sesión existente válida. SessionId:', SessionId);
    }
    next();
  } catch (error) {
    handleLoginLogger.error('Error al manejar el inicio de sesión:', error);
    next(error);
  }
}

async function performLogin(maxRetries) {
  let retries = maxRetries;

  while (retries >= 0) {
    handleLoginLogger.info('Intentos restantes:', retries);

    try {
      const loginEndpoint = 'Login';
      const credentials = {
        UserName: process.env.USERSAP,
        Password: process.env.PASSWORD,
        CompanyDB: process.env.COMPANYDB,
      };

      const agent = new https.Agent({
        rejectUnauthorized: false,
      });

      const response = await axios.post(rutaRaiz + loginEndpoint, credentials, {
        httpsAgent: agent,
      });

      const sessionData = response.data;
      sessionData.timestamp = new Date().toISOString();

      handleLoginLogger.info('Inicio de sesión exitoso.');
      return {
        success: true,
        sessionData,
      };
    } catch (error) {
      handleLoginLogger.error('Error al realizar el inicio de sesión:', error);
      retries -= 1;
    }
  }

  handleLoginLogger.error('No se pudo iniciar sesión después de varios intentos.');
  return {
    success: false,
    error: 'No se pudo iniciar sesión después de varios intentos.',
  };
}

function isSessionIdExpired(timestamp) {
  const date = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000 - 3 * 60 * 60 * 1000);
  date.setHours(date.getHours() - 1);
  const sessionTimestamp = isValidDate(new Date(timestamp)) ? new Date(timestamp) : date;

  return sessionTimestamp <= date;
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

module.exports = {
  handleLogin,
};

