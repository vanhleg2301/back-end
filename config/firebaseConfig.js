// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported  } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9m2hNnQYXuYy7rkSWpa4dBMbBQODf55s",
  authDomain: "front-end-ai-e2ee8.firebaseapp.com",
  projectId: "front-end-ai-e2ee8",
  storageBucket: "front-end-ai-e2ee8.appspot.com",
  messagingSenderId: "274803394581",
  appId: "1:274803394581:web:5e83bb3bf57a229f0ae61c",
  measurementId: "G-7ZGHKTP9DY"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

// Check if Analytics is supported before initializing
if (await isSupported()) {
  const analytics = getAnalytics(app);
}

export { storage };

