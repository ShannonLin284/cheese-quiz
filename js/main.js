// main.js
// ============================================================
// Quiz controller + name page + Firebase logging
// ============================================================

import { setPlayerName, logPlay } from "./firebase-backend.js";

document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
     QUIZ STATE
  ================================ */
  let quizScores = { I: 0, E: 0, T: 0, F: 0, A: 0, G: 0, H: 0, S: 0 };
  let currentPage = 0;

  /* ===============================
     CHEESE DEFINITIONS
  ================================ */
  const Cheeses = {
    BRIE: "Brie",
    MOZZ: "Mozzarella",
    BLUE: "Blue Cheese",
    AMERICAN: "American",
    COTTAGE: "Cottage Cheese",
    GOAT: "Goat Cheese",
    FETA: "Feta",
    MASCARPONE: "Mascarpone",
    RICOTTA: "Ricotta",
    MANCHEGO: "Manchego",
    GOUDA: "Gouda",
    CHEDDAR: "Cheddar",
  };

  const cheeseProfiles = {
    BRIE: { I: 2.5, E: 2, T: 2, F: 2.5, A: 2.5, G: 2, H: 1.5, S: 3.5 },
    MOZZ: { I: 1, E: 4, T: 1.5, F: 3.5, A: 2.5, G: 2.5, H: 3.5, S: 1.5 },
    BLUE: { I: 3.5, E: 1.5, T: 3.5, F: 1.5, A: 1.5, G: 3.5, H: 2, S: 3 },
    AMERICAN: { I: 2, E: 3, T: 1.5, F: 3.5, A: 2.5, G: 2.5, H: 4, S: 1 },
    COTTAGE: { I: 4, E: 1, T: 2, F: 3, A: 2.5, G: 2.5, H: 4, S: 1 },
    GOAT: { I: 3.5, E: 1.5, T: 3, F: 2, A: 3, G: 2, H: 3.5, S: 1.5 },
    FETA: { I: 4, E: 1, T: 4, F: 1, A: 2.5, G: 2.5, H: 1, S: 4 },
    MASCARPONE: { I: 1.5, E: 3.5, T: 3.5, F: 1.5, A: 1, G: 4, H: 3, S: 2 },
    RICOTTA: { I: 2, E: 3, T: 1, F: 4, A: 4, G: 1, H: 1.5, S: 3.5 },
    MANCHEGO: { I: 2, E: 3, T: 2, F: 3, A: 2, G: 3, H: 2, S: 3 },
    GOUDA: { I: 1.5, E: 3.5, T: 3, F: 1, A: 3.5, G: 1.5, H: 3.5, S: 1.5 },
    CHEDDAR: { I: 1, E: 4, T: 1, F: 4, A: 1.5, G: 3.5, H: 3.5, S: 1.5 },
  };

  /* ===============================
     PAGE FLOW
  ================================ */
  const landing = document.getElementById("landing_page");
  const namePage = document.getElementById("name_page");
  const startBtn = document.getElementById("start_button_wrapper");
  const nameInput = document.getElementById("name_input");
  const nameContinue = document.getElementById("name_continue_wrapper");

  // Allow Enter key to submit name
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      nameContinue.click();
    }
  });

  startBtn.addEventListener("click", () => {
    landing.style.display = "none";
    namePage.style.display = "block";
  });

  nameContinue.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) return alert("Please enter a name");

    setPlayerName(name);

    namePage.style.display = "none";
    currentPage = 1;
    document.getElementById("quiz_page_1").style.display = "block";
  });

  /* ===============================
     RESULT CALCULATION
  ================================ */
  function cheeseResult(score) {
    let bestCheese = null;
    let bestMatch = -Infinity;

    const scoreMagnitude = Math.sqrt(
      Object.values(score).reduce((s, v) => s + v * v, 0)
    );

    for (const key in cheeseProfiles) {
      const profile = cheeseProfiles[key];
      let dot = 0;
      let mag = 0;

      for (const trait in score) {
        dot += score[trait] * profile[trait];
        mag += profile[trait] * profile[trait];
      }

      const similarity = dot / (scoreMagnitude * Math.sqrt(mag));
      if (similarity > bestMatch) {
        bestMatch = similarity;
        bestCheese = Cheeses[key];
      }
    }

    return bestCheese;
  }

  /* ===============================
     QUIZ BUTTON HANDLING
  ================================ */
  document.querySelectorAll(".quiz_option").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!btn.dataset.points) return;

      const pts = JSON.parse(btn.dataset.points);
      for (const k in pts) quizScores[k] += pts[k];

      const prev = currentPage;
      currentPage++;

      document.getElementById("quiz_page_" + prev).style.display = "none";

      if (currentPage <= 16) {
        document.getElementById("quiz_page_" + currentPage).style.display =
          "block";
      } else {
        document.getElementById("loading").style.display = "block";

        setTimeout(async () => {
          document.getElementById("loading").style.display = "none";
          document.getElementById("result").style.display = "block";

          const cheese = cheeseResult(quizScores);
          const img = document.getElementById("result_image");
          img.src = "images/" + cheese + ".png";
          img.alt = cheese;

          await logPlay(cheese);
        }, 3000);
      }
    });
  });
});

const downloadButton = document.getElementById("download_button");
const shareButton = document.getElementById("share_button");
const resultImage = document.getElementById("result_image");
const allCheesesButton = document.getElementById("all_cheeses_button");
const backButton = document.getElementById("back_button");

downloadButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = resultImage.src;
  link.download = "Cheese.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

shareButton.addEventListener("click", async () => {
  try {
    const response = await fetch(resultImage.src);
    const blob = await response.blob();
    const file = new File([blob], "Cheese.png", { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "The Cheese Quiz",
        text: "Check out my cheese result!\nAll cheeses @ thecheesequiz.com 🧀",
      });
    } else {
      alert("Sharing not supported on this device. Try downloading instead!");
    }
  } catch (err) {
    console.error("Share failed:", err);
  }
});

allCheesesButton.addEventListener("click", () => {
  document.getElementById("result").style.display = "none";
  document.getElementById("all_cheeses").style.display = "block";
});

backButton.addEventListener("click", () => {
  document.getElementById("all_cheeses").style.display = "none";
  document.getElementById("result").style.display = "block";
});
