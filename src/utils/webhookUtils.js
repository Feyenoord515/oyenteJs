//handleWebhook:
const express = require("express");
const router = express.Router();
const xml2js = require("xml2js");
const querystring = require("querystring");
const handleWebhookLogger = require('../services/handleWebhookLogger');
const fs = require("fs");

const tempDataFilePath = "tempData.txt";


const handleErrors = (err, res, message) => {
  
  handleWebhookLogger.error(message, err);
  return res.status(500).send(`${message}: ${err.message}`);
};


const handleWebhook = (req, res, next) => {
  try {
    const urlEncodedData = req.body.DetalleComprobante;
    const decodedData = querystring
      .unescape(urlEncodedData)
      .replace(/\+/g, "  ");

    xml2js.parseString(decodedData, (err, result) => {
      if (err) {
        return handleErrors(err, res, "Error al analizar XML");
      }

      const comprobante = result;

      if (comprobante) {
        let data = [];
        data.unshift(comprobante);

        try {
          fs.appendFileSync(tempDataFilePath, JSON.stringify(data));
        } catch (writeError) {
          return handleErrors(
            writeError,
            res,
            "Error al escribir en el archivo tempData"
          );
        }
        handleWebhookLogger.addReceivedTicket(comprobante);
        
        
      } else {
        
        handleWebhookLogger.error("Tipo de datos no reconocido", err);
        return res.status(400).send("Tipo de datos no reconocido");
      }
    });
  } catch (error) {
    
    return handleErrors(error, res, "Error no manejado en el webhook");
  }
};

module.exports = {
  handleWebhook,
};
