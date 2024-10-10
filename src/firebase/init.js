// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1hDSjHg5c6QqwRATzI9gshFU07RKbRwU",
  authDomain: "sub3-yiting.firebaseapp.com",
  projectId: "sub3-yiting",
  storageBucket: "sub3-yiting.appspot.com",
  messagingSenderId: "992185057116",
  appId: "1:992185057116:web:7fc4385fcce42c4ee7cb99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const db = getFirestore()
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);


// Check if running locally and connect to the emulator if true
if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}
// else {
//   firebase.functions().useFunctionsEmulator("https://us-central1-sub3-yiting.cloudfunctions.net");
// }


export { functions, db, auth, storage, httpsCallable };
