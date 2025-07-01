// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATSXYYd-HyNZZyiGYoKXbOLxcbXJvRh1M",
  authDomain: "pelktech-fc118.firebaseapp.com",
  projectId: "pelktech-fc118",
  storageBucket: "pelktech-fc118.firebasestorage.app",
  messagingSenderId: "394579735510",
  appId: "1:394579735510:web:224634fc0d1db2494daa77",
  measurementId: "G-SL1EB986RV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export default app;
export { db };