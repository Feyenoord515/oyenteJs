const express = require("express");
const router = express.Router();
const xml2js = require("xml2js");
const querystring = require("querystring");
const handleWebhookLogger = require('../services/handleWebhookLogger');
const fs = require("fs");
const firebase = require('../../config/firebase');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const tempDataFilePath = "tempData.txt";


const handleErrors = (err, res, message) => {
  
  handleWebhookLogger.error(message, err);
  return res.status(500).send(`${message}: ${err.message}`);
};


const handleWebhook = (req, res, next) => {
  return new Promise(async (resolve, reject) => {
      try {
    const urlEncodedData = req.body.DetalleComprobante;
    const decodedData = querystring
      .unescape(urlEncodedData)
      .replace(/\+/g, "  ");

      xml2js.parseString(decodedData, async (err, result) => {
        if (err) {
            reject(handleErrors(err, res, "Error al analizar XML"));
            return;
        }

        const comprobante = result;
        const respuestasCollection = collection(firebase.firebaseFirestore, 'respuestas');

        if (comprobante) {
            let data = [];
            data.unshift(comprobante);

            try {
                await addDoc(respuestasCollection, {
                    detalleComprobante: JSON.stringify(data),
                    timestamp: serverTimestamp(),
                });
                fs.appendFile(tempDataFilePath, JSON.stringify(data), (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                handleWebhookLogger.addReceivedTicket(comprobante);
                resolve();
            } catch (writeError) {
                reject(handleErrors(
                    writeError,
                    res,
                    "Error al escribir en el archivo tempData"
                ));
            }
        } else {
            reject(handleErrors("Tipo de datos no reconocido", res));
        }
    });
} catch (error) {
    reject(handleErrors(error, res, "Error no manejado en el webhook"));
}
});
};

module.exports = {
  handleWebhook,
};

