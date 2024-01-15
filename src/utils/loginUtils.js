const axios = require('axios');
require("dotenv").config();
const https = require('https');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const rutaRaiz = "https://10.0.0.2:50000/b1s/v2/";

const login = async (maxRetries = 2) => {
  
  let retries = maxRetries;

  while (retries >= 0) {
    console.log("Intentos restantes:", retries);

    try {
      const loginEndpoint = "Login";
      const credentials = {
        UserName: manager,
        Password: "Ruta#205#",
        CompanyDB: ZDISTRITEST,
      };

      const agent = new https.Agent({
        rejectUnauthorized: false,
      });

      const response = await axios.post(rutaRaiz + loginEndpoint, credentials, {
        httpsAgent: agent,
      });

      const sessionData = response.data;
      sessionData.timestamp = new Date().toISOString();
      const newSessionId = response.data.SessionId;

      console.log("Inicio de sesión exitoso.");
      return {
        success: true,
        sessionData,
      };
    } catch (error) {
      console.error("Error al realizar el inicio de sesión:", error);
      retries -= 1;
    }
  }

  console.error("No se pudo iniciar sesión después de varios intentos.");
  return {
    success: false,
    error: "No se pudo iniciar sesión después de varios intentos.",
  };
};

module.exports = {
  login,
};


