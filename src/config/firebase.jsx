// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCU7lz9ijnL5SAak3_AUNW_WrytTq50LNE",
  authDomain: "irs-capstone.firebaseapp.com",
  databaseURL: "https://irs-capstone-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "irs-capstone",
  storageBucket: "irs-capstone.appspot.com",
  messagingSenderId: "718420727642",
  appId: "1:718420727642:web:fbc56782b078e192b24563"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);