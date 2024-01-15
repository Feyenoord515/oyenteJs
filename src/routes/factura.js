// factura.js
const express = require("express");
require("dotenv").config();
const router = express.Router();
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const cookieParser = require("cookie-parser");
router.use(cookieParser());
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const logger = require("../services/logger");
router.use(
  session({
    store: new FileStore(), // Almacenará las sesiones en archivos (puedes cambiarlo a otras opciones según tus necesidades)
    secret: "tu_secreto", // Reemplaza con una cadena secreta para firmar las cookies de sesión
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
const urlinvoices = process.env.URLINVOICES;

router.post("/", async (req, res) => {
  console.log(" estoy en factura. ");
  const id = req.session.SessionId;
  if (!id) {
    res.redirect("/login");
  }
  console.log("llega la sesion?", id);
  const sesion = JSON.parse(fs.readFileSync("session.json"));
  // const sessionId = sesion.SessionId
  const sessionId = req.session.SessionId;

  console.log("Usando SessionId:", sessionId);

  try {
    const rawData = fs.readFileSync("tempData.json");
    const tickets = JSON.parse(rawData);

    const ticketId = tickets[0].Comprobante.IdComprobante[0];
    console.log(ticketId);
    const data = {
      CardCode: "C".concat(tickets[0].Comprobante.Cliente[0].NroDocumento[0]),
      DocDate: tickets[0].Comprobante.FechaHora[0].toString().slice(0, 10),
      DocDueDate: tickets[0].Comprobante.FechaHora[0].toString().slice(0, 10),
      FederalTaxID: tickets[0].Comprobante.Cliente[0].NroDocumento[0],
      U_WESAP_CarrierCod: "673",
      SalesPersonCode: 65,
      DocumentLines: tickets[0].Comprobante.Items[0].ComprobanteItem.map(
        (article, index) => {
          return {
            LineNum: index,
            ItemCode: article.Codigo[0],
            ItemDescription: article.Detalle[0],
            Quantity: parseFloat(article.Cantidad[0]),
            ShipDate: "2023-06-30",
            Price: 5949.9168,
            PriceAfterVAT: 7199.3993,
            Currency: "ARS",
            Rate: 0.0,
            DiscountPercent: 7.0,
            VendorNum: "",
            SerialNum: null,
            WarehouseCode: "003",
            SalesPersonCode: 65,
            AccountCode: "4.1.010.10.001", //"1.1.040.10.000" ,//,
            CostingCode: "2100000",
            ProjectCode: "1901",
            COGSCostingCode: "2100000",
            COGSAccountCode: "4.2.010.10.001", //"1.1.040.20.998" ,//,
            CostingCode2: "102",
            LineTaxJurisdictions: [
              {
                JurisdictionCode: "IVA_21",
                JurisdictionType: 1,
                TaxAmount: 4997.9301,
                TaxAmountSC: 18.2873,
                TaxAmountFC: 0.0,
                TaxRate: 21.0,
                DocEntry: 604579,
                LineNumber: 0,
                RowSequence: 0,
                ExternalCalcTaxRate: 0.0,
                ExternalCalcTaxAmount: 0.0,
                ExternalCalcTaxAmountFC: 0.0,
                ExternalCalcTaxAmountSC: 0.0,
              },
            ],
            ExportProcesses: [],
            EBooksDetails: [],
            DocumentLineAdditionalExpenses: [],
            WithholdingTaxLines: [],
            SerialNumbers: [],
            BatchNumbers: [
              {
                BatchNumber: "ARN3333333333000",
                ManufacturerSerialNumber: null,
                InternalSerialNumber: null,
                ExpiryDate: null,
                ManufacturingDate: null,
                AddmisionDate: "2023-07-13",
                Location: null,
                Notes: null,
                Quantity: parseFloat(article.Cantidad[0]),
                BaseLineNumber: 0,
                TrackingNote: null,
                TrackingNoteLine: null,
                ItemCode: article.Codigo[0],
                SystemSerialNumber: 1,
                U_ARNGS_FSHADE: null,
                U_ARGNS_SHGROUP: null,
                U_ARGNS_FWIDTH: 0.0,
                U_ARGNS_AWIDTH: 0.0,
                U_ARGNS_SHLENTH: 0.0,
                U_ARGNS_SHWIDTH: 0.0,
                U_ARGNS_GROUPID: null,
                U_ARGNS_SORefNo: null,
                U_ARGNS_SORefID: null,
                U_ARGNS_FABWidth: null,
                U_ARGNS_SHRGroup: null,
              },
            ],
            CCDNumbers: [],
            DocumentLinesBinAllocations: [],
          };
        }
      ),
    };

    console.log(data);
    const headers = {
      Cookie: `B1SESSION=${sessionId}`,
    };

    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const config = {
      method: "post",
      url: urlinvoices,
      headers: headers,
      httpsAgent: agent,
      data: data,
    };

    const response = await axios.request(config);
    console.log("Factura creada exitosamente:", config.data);
    logger.info("Factura creada exitosamente:", response.data);
    saveSuccessId(ticketId, response.data.DocEntry);
    console.log(response.data.DocEntry)
    res.json(response.data);
  } catch (error) {
    console.error("Error al procesar la factura:", error);

    if (error.response) {
      if (error.response.data.error.code === "-2028") {
        fs.writeFile(
          "Invalid BP code.json",
          JSON.stringify(error.response.data),
          (err) => {
            if (err) {
              console.error("Error al guardar el archivo:", err);
            } else {
              console.log("Error guardado en el archivo Invalid BP code.json");
            }
          }
        );
      }
      if (error.response.data.error.code === "301") {
        console.log(
          "Error 301 - Sesión expirada. Iniciando sesión nuevamente..."
        );
        req.session.destroy();
        return res.redirect("/login");
      } else {
        const facturaConError = {
          factura: error.response.config.data,
          mensajeError: error.response.data,
        };

        console.log("Factura con error guardada:");
        logger.error("Error al crear la factura:", facturaConError);
        res.status(error.response.status).json(error.response.data);
      }
    } else if (error.request) {
      console.error(
        "No se recibió respuesta de SAP. redirijo a login",
        error.code
      );
      logger.error("Error, NO SE RECIBIO RESPUESTA DE SAP: ", error.code);
      req.session.destroy();
      res.redirect("/login");
    } else {
      // Otros errores
      console.error("Error desconocido al procesar la factura:", error.message);
      logger.error("Error desconocido al procesar la factura: ", error);
      res.status(500).send("Error desconocido al procesar la factura.");
    }
  }
});
function saveSuccessId(ticketId, docEntry) {
  try {
    let successIds;
    try {
      successIds = fs.readFileSync('successIds.json', 'utf8');
      successIds = JSON.parse(successIds);
    } catch (readError) {
      successIds = [];
    }

    if (!Array.isArray(successIds)) {
      successIds = [];
    }

    const successInfo = {
      ticketId: ticketId,
      docEntry: docEntry
    };

    successIds.unshift(successInfo);

    fs.writeFileSync('successIds.json', JSON.stringify(successIds));

    console.log(`ID ${ticketId} y DocEntry ${docEntry} guardados en successIds.json`);
  } catch (error) {
    console.error('Error al guardar el ID en successIds.json:', error);
  }
}

module.exports = router;
