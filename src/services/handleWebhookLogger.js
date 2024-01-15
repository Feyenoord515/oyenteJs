// handleWebhookLogger.js
const winston = require("winston");
const moment = require("moment-timezone");

moment.tz.setDefault('America/Argentina/Buenos_Aires')
// Arrays para almacenar los tickets recibidos
const successfulTickets = [];
const errorTickets = [];

const handleWebhookLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format((info) => {
      info.timestamp = moment().format(); // Utiliza el formato de timestamp de moment
      return info;
    })(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: "handleWebhook.log" })],
});

// Middleware para agregar los tickets al array antes de registrarlos en el archivo
handleWebhookLogger.addReceivedTicket = (ticket) => {
  try {
    if (ticket.Comprobante) {
      //éxito
      successfulTickets.push(ticket);
      handleWebhookLogger.info("Comprobante recibido con éxito:", ticket);
    } else {
      //falla
      errorTickets.push(ticket);
      handleWebhookLogger.error(
        "Ticket recibido no es un comprobante válido:",
        ticket
      );
    }
  } catch (error) {
    handleWebhookLogger.error("Error al procesar el ticket:", error);
  }
};

// Método para obtener todos los tickets procesados con éxito
handleWebhookLogger.getSuccessfulTickets = () => {
  return successfulTickets;
};

// Método para obtener todos los tickets con error
handleWebhookLogger.getErrorTickets = () => {
  return errorTickets;
};

// Método para limpiar los tickets almacenados
handleWebhookLogger.clearTickets = () => {
  successfulTickets.length = 0;
  errorTickets.length = 0;
};

module.exports = handleWebhookLogger;
