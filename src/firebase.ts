import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  addDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0930602584",
  appId: "1:140989933378:web:1d77d39a8a7febe1a60adb",
  apiKey: "AIzaSyCOyrRlJz8voqUF7UXSe7Lsz-OfEnZcAP4",
  authDomain: "gen-lang-client-0930602584.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-topupapp-7cbcfc1d-d676-4eac-bf74-e4e2c2d49ceb",
  storageBucket: "gen-lang-client-0930602584.firebasestorage.app",
  messagingSenderId: "140989933378"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  deleteDoc
};
