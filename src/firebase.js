// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5JncWlJFW0wruu3D9W5hoFdLuGYkRHUI",
  authDomain: "pelktech-2f7b4.firebaseapp.com",
  projectId: "pelktech-2f7b4",
  storageBucket: "pelktech-2f7b4.firebasestorage.app",
  messagingSenderId: "555668004988",
  appId: "1:555668004988:web:4dcc2e6aa43932a447e9f9",
  measurementId: "G-5G8R35GJ1S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export default app;
export { db };