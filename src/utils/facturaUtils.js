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
const handleWebhookModule = require('../utils/webhookUtils')
const loginUtils = require('../utils/loginUtils');

const sessionMiddleware = session({
  store: new FileStore(),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 604800000 } // 7 days
});

router.use(sessionMiddleware);

const handleFactura = async (req, res) => {
  try {
    await handleWebhookModule.handleWebhook(req, res);
    const { success, sessionData } = await loginUtils.login();
    console.log("Estoy en factura.");

    if (success) { 
      const successfulTickets = handleWebhookLogger.getSuccessfulTickets();

      if (successfulTickets.length === 0) {
        console.log("no hay tickets validos por cargar");
      }

      try {
        const tickets = await successfulTickets;
        console.log(tickets);
        const data = JSON.stringify({
          CardCode: "C".concat(tickets[0].Comprobante.Cliente[0].NroDocumento[0]),
          DocDate: tickets[0].Comprobante.FechaHora[0].toString().slice(0, 10),
          DocDueDate: tickets[0].Comprobante.FechaHora[0].toString().slice(0, 10),
          FederalTaxID: tickets[0].Comprobante.Cliente[0].NroDocumento[0],
          U_WESAP_CarrierCod: "673",
          SalesPersonCode: 65
        });

        const agent = new https.Agent({
          rejectUnauthorized: false,
        });

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://10.0.0.2:50000/b1s/v2/Invoices',
          headers: { 
            Cookie: `B1SESSION=${sessionData.SessionId}`,
          },
          httpsAgent: agent,
          data: data
        };

        const response = await axios.request(config);

        handleFacturaLogger.info("Factura creada exitosamente:", response.data);

        // Limpiar el ticket exitoso del array
        handleWebhookLogger.clearTickets();
      } catch (error) {
        console.log(error.response.data);
        if (error.response.data) {
          const errorTicket = handleWebhookLogger.getSuccessfulTickets();
          const errorMessage = error.response.data
          const failures = {
            errorTicket: errorTicket,
            errorMessage: errorMessage
          }
          fs.appendFile('tickets_conerror.response.data.txt', JSON.stringify(error + '\n', failures) + '\n', (writeErr) => {
            if (writeErr) {
              console.error('Error al escribir el ticket con error:', writeErr);
            } else {
              console.log('Ticket con error guardado en tickets_conerror.response.data.txt');
            }
          });
        } else if(error.response){
          const errorTicket = handleWebhookLogger.getSuccessfulTickets();
          const errorMessage = error.response
          const failures = {
            errorTicket: errorTicket,
            errorMessage: errorMessage
          }
          fs.appendFile('tickets_con_error_response.txt', JSON.stringify(error + '\n', failures) + '\n', (writeErr) => {
            if (writeErr) {
              console.error('Error al escribir el ticket con error:', writeErr);
            } else {
              console.log('Ticket con error guardado en tickets_con_error_response.txt');
            }
          });
        } else if (error) {
          fs.appendFile('tickets_con_error_deconocido.txt', JSON.stringify(error) + '\n', (writeErr) => {
            if (writeErr) {
              console.error('Error al escribir el ticket con error:', writeErr);
            } else {
              console.log('Ticket con error guardado en tickets_con_error_deconocido.txt');
            }
          });
        }
        handleWebhookLogger.clearTickets();
      }
    } 
  } catch (error) {
    console.error('Error en la operación:', error);
    res.status(500).send('Error en la operación.');
  }
};

module.exports = {
  handleFactura,
};
