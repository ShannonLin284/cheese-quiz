// firebase-backend.js
// ============================================================
// Firebase backend for Cheese Quiz
// Stores: name + cheese + timestamp
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyABlpfyfgx_vBcZmnyp7li7pTGb2d8gS80",
  authDomain: "cheese-quiz.firebaseapp.com",
  projectId: "cheese-quiz",
  storageBucket: "cheese-quiz.appspot.com",
  messagingSenderId: "864856413736",
  appId: "1:864856413736:web:4055d3014a4a46055e471d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Save name
export function setPlayerName(name) {
  localStorage.setItem("cheese_player_name", name);
}

export function getPlayerName() {
  return localStorage.getItem("cheese_player_name");
}

// Log quiz play
export async function logPlay(cheese) {
  const name = getPlayerName();

  await addDoc(collection(db, "plays"), {
    name,
    cheese,
    timestamp: serverTimestamp()
  });

  console.log("Logged play:", name, cheese);
}
