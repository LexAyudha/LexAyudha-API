// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLtzt52r7JwA8Leg6E7WMi6FhJS8kN-N4",
  authDomain: "lexayudha-71fc6.firebaseapp.com",
  projectId: "lexayudha-71fc6",
  storageBucket: "lexayudha-71fc6.firebasestorage.app",
  messagingSenderId: "473905344150",
  appId: "1:473905344150:web:ca531bb4e98c0aafd89cb7",
  measurementId: "G-M35DBVCEJR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const fireBaseStorage = getStorage(app);

module.exports = { fireBaseStorage};