import {
  collection,
  getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../js/firebase-backend.js"; 

async function countDocs() {
  const coll = collection(db, "plays");
  const snapshot = await getCountFromServer(coll);
  console.log("🧀 Total cheese finders:", snapshot.data().count);
}

countDocs();
