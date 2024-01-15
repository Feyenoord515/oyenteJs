//webhook.js
const express = require('express');
const router = express.Router();
const logger = require('../services/logger');
const facturaUtils = require('../utils/facturaUtils');


router.use('/', async (req, res) => {
  try {
    
    
  
    await facturaUtils.handleFactura(req, res);
    
    
    if (!res.headersSent) {
      res.status(200).send('hecho');
    }
  } catch (error) {
    
    logger.error('Error en la operación:', error);
    if (!res.headersSent) {
      res.status(500).send('Error en la operación.');
    }
  }
});




module.exports = router;
