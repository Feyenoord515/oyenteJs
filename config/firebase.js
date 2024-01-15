// Importa los módulos necesarios de Firebase con CommonJS
const { initializeApp } = require('firebase/app');
// const { getAnalytics } = require('firebase/analytics');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAzU-F6GYBa8HmR2XVMqIJy064jknrSObw",
  authDomain: "oyentejs.firebaseapp.com",
  databaseURL: "https://oyentejs-default-rtdb.firebaseio.com",
  projectId: "oyentejs",
  storageBucket: "oyentejs.appspot.com",
  messagingSenderId: "1043150970129",
  appId: "1:1043150970129:web:0a4884be56ef50f61200b0"
};

// Inicializa tu aplicación Firebase
const app = initializeApp(firebaseConfig);

// Obtiene instancias de módulos específicos si es necesario
// const analytics = getAnalytics(app);
const firebaseFirestore = getFirestore(app);
const firebaseAuth = getAuth();

module.exports = { app, firebaseFirestore, firebaseAuth };
