# Webhook para SAP Business One

Este es un webhook que permite recibir archivos XML, convertirlos en JSON y luego crear facturas en SAP Business One utilizando Service Layer. El webhook está implementado en Node.js y utiliza Express como framework de servidor.

## Funcionalidad

El webhook consta de tres rutas principales:

### 1. Ruta de Webhook
- **Ruta:** `/webhook`
- **Método:** `POST`
- **Descripción:** Esta ruta recibe archivos XML como notificaciones a través de una solicitud POST, los convierte en formato JSON y almacena los datos en una lista.

### 2. Ruta de Inicio de Sesión en SAP
- **Ruta:** `/login`
- **Método:** `POST`
- **Descripción:** Esta ruta se encarga de realizar el inicio de sesión en el sistema SAP Business One Service Layer. Almacena el `SessionId` en una cookie de manera segura para su uso posterior.

### 3. Ruta de Creación de Factura en SAP
- **Ruta:** `/crear-factura`
- **Método:** `POST`
- **Descripción:** Esta ruta crea facturas en SAP Business One a partir de los datos almacenados en la lista. Utiliza el `SessionId` almacenado en la cookie para autenticarse en SAP y enviar los datos de la factura.

## Requisitos

- Node.js instalado en el servidor.
- Las dependencias del proyecto deben instalarse utilizando `npm install`.
- Configurar las variables de entorno en un archivo `.env` con las credenciales de SAP y otros detalles necesarios.

## Configuración de Variables de Entorno

Configurar las siguientes variables de entorno en un archivo `.env`:
RUTARAIZ=https://url-de-sap-business-one
USERSAP=usuario-de-sap
PASSWORD=contraseña-de-sap
COMPANYDB=nombre-de-la-DATA BASE-sap


## Ejecución

- Para iniciar el servidor, utilizar el comando `node listener.js`.
- El servidor estará escuchando en el puerto especificado en el código (en este caso, el puerto 3001).

## Seguridad

Se han implementado medidas de seguridad, como el manejo de cookies seguras y la protección contra errores en el inicio de sesión. Sin embargo, es fundamental revisar y ajustar la seguridad.
## Registro y Errores

El webhook utiliza la biblioteca Winston para registrar información y errores en archivos de registro separados. Revisar estos registros regularmente.

## Mantenimiento

Este webhook es una herramienta crítica para la automatización de procesos. Realizar un seguimiento y mantenimiento constante para garantizar su correcto funcionamiento.
