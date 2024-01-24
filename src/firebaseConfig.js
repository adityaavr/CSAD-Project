// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDHzN7nkeeUKhm6I5PtItlXPRzQNd7zbus",
    authDomain: "planthara-da437.firebaseapp.com",
    projectId: "planthara-da437",
    storageBucket: "planthara-da437.appspot.com",
    messagingSenderId: "1005621508418",
    appId: "1:1005621508418:web:e8557dc967258f6b3430db",
    measurementId: "G-MGFHWPPTGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { db, storage };