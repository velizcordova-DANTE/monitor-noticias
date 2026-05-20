import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCMlgzPnqpNRZxb72KRzOyp6TRQ7HbJbEg",
  authDomain: "monitoreo-de-noticias-b1e9c.firebaseapp.com",
  projectId: "monitoreo-de-noticias-b1e9c",
  storageBucket: "monitoreo-de-noticias-b1e9c.firebasestorage.app",
  messagingSenderId: "917178761928",
  appId: "1:917178761928:web:c16b63b249f7cf3a29dbfd",
  measurementId: "G-4YN7G7DDB1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
