// cookieAuth.js
const fs = require('fs');
function cookieAuth(req, res, next) {
    const sessionId = fs.readFileSync('authData.json') || req.cookies.SessionId;
  
    if (typeof sessionId === 'undefined' || sessionId.length < 2) {
     
      return res.status(401).send('No se encontró una sesión válida. Por favor, inicia sesión.');
    }
  
    // Si las cookies son válidas, continúa con la siguiente ruta.
   next()
  }
  
  module.exports = cookieAuth;
  