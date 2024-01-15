const express = require('express');
const session = require("express-session"); 
const FileStore = require("session-file-store")(session);
const authService = require('../utils/loginUtils');

const router = express.Router();
router.use(
  session({
    store: new FileStore(), // Almacenará las sesiones en archivos 
    secret: "tu_secreto", 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);
function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}


router.post("/", async (req, res, next) => {
  const id = req.session
  console.log(id)
  const date = new Date();
  date.setHours(date.getHours() - 1);
  const timestamp = isValidDate(new Date(id.timestamp)) ? new Date(id.timestamp) : date;
  console.log(timestamp)
  console.log(date)
  if ( timestamp <= date ){
  const { maxRetries } = 2

  try {
    const result = await authService.handleLogin(maxRetries);
    if (result.success) {
      req.session.SessionId = result.sessionData.SessionId;
      req.session.timestamp = result.sessionData.timestamp;

      return res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    }

    return res.status(500).json({ error: result.error });
  } catch (error) {
    next(error);
  }}else{return res.status(200).json({ message: 'Inicio de sesión exitoso.' });}
});

module.exports = router;
