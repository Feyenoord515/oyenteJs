// handleFactura.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const cookieParser = require("cookie-parser");
router.use(cookieParser());
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const handleFacturaLogger = require("../services/handleFacturaLogger");
const handleWebhookLogger = require('../services/handleWebhookLogger');

router.use(
  session({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET || "tu_secreto",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const handleFactura = async (req, res) => {
  try {
    console.log("Estoy en factura.");

    const sessionId = req.session.SessionId;
   
    const successfulTickets = handleWebhookLogger.getSuccessfulTickets();
    if (successfulTickets.length == 0){console.log("no hay tickets validos por cargar")}
    fs.readFile("tempData.txt", async (err, buffer) => {
      // console.log(buffer.toString('utf-8'));
      const tickets = successfulTickets
      console.log(tickets);
      const data = {
        CardCode: "C".concat(tickets[0].Comprobante.Cliente[0].NroDocumento[0]),
        DocDate: tickets[0].Comprobante.FechaHora[0].toString().slice(0, 10),
        DocDueDate: tickets[0].Comprobante.FechaHora[0].toString().slice(0, 10),
        FederalTaxID: tickets[0].Comprobante.Cliente[0].NroDocumento[0],
        U_WESAP_CarrierCod: "673",
        SalesPersonCode: 65,
      };

      const agent = new https.Agent({
        rejectUnauthorized: false,
      });

      const config = {
       
       
        httpsAgent: agent,
       
        headers: {
          'Cookie': `B1SESSION=${sessionId}`,
          'Content-Type': 'application/json',
        }
      };

      try {
        const response = await axios.post(process.env.URLINVOICES, data, config);

        
        handleFacturaLogger.info("Factura creada exitosamente:", response.data);

        // Limpiar el ticket exitoso del array
        handleWebhookLogger.clearTickets();
      } catch (error) {
        console.log(error.response.data);
        const errorTicket = handleWebhookLogger.getSuccessfulTickets();
        const errorMessage = error.response.data || error.response || error;
        const failures = {
          errorTicket: errorTicket,
          errorMessage: errorMessage
        }
        if(error.response){
          handleFacturaLogger.error('Error Message:', failures);
      } else {
        fs.appendFile('tickets_con_error_en_sap.txt', JSON.stringify(error + '\n', failures) + '\n', (writeErr) => {
          if (writeErr) {
            console.error('Error al escribir el ticket con error:', writeErr);
          } else {
            console.log('Ticket con error guardado en tickets_con_error_en_sap.txt');
          }
        });
      }
      handleWebhookLogger.clearTickets();
        // Si hay un error, los tickets con éxito permanecen en el array
      }
      
    });
  } catch (error) {
    console.error('Error en la operación:', error);
    res.status(500).send('Error en la operación.');
  }
};

module.exports = {
  handleFactura,
};

