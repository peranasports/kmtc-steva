import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAynSXpV6qlSmFiYYwg7ivqI9Un99_D6oY",
  authDomain: "kmtc-steva.firebaseapp.com",
  projectId: "kmtc-steva",
  storageBucket: "kmtc-steva.appspot.com",
  messagingSenderId: "547773464135",
  appId: "1:547773464135:web:5caf58b064ad681888bb62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore()