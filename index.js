// index.js
//  process.on('unhandledRejection', (reason, promise) => {    //El process.on('unhandledRejection', ...) debe colocarse al principio de su secuencia de comandos, antes de que se ejecute cualquier código asincrónico. Esto garantiza que capture los rechazos de promesas no controlados desde el principio.
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
// });
const express = require('express');
require("dotenv").config();
const app = express();
//const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const webhookRoute = require('./src/routes/webhook'); 
//const errorHandling = require('./src/middleware/errorHandling');
const logger = require('./src/services/logger');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const helmet = require('helmet');

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/webhook', webhookRoute);

const port = process.env.PORT;

 app.listen(port, () => {
  logger.info(`Servidor escuchando en el puerto ${port}`);
  console.log(`Servidor escuchando en el puerto ${port}`);
});
