//webhook.js
const express = require('express');
const router = express.Router();
const logger = require('../services/logger');
const webhookUtils = require('../utils/webhookUtils');
const loginUtils = require('../utils/loginUtils');
const facturaUtils = require('../utils/facturaUtils');


router.use('/', async (req, res) => {
  try {
    // await webhookUtils.handleWebhook(req, res, next);
    // logger.info('Webhook procesado exitosamente');
    
  
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
