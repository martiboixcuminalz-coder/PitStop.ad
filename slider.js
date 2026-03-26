document.addEventListener("DOMContentLoaded", () => {
  initBillboard();
  initReviews();
});

/* =========================
   BILLBOARD ROTATIU
========================= */
function initBillboard() {
  const img = document.getElementById("billboardImg");
  if (!img) return;

  const frames = ["logo.jpg", "foto1.jpg", "foto2.jpg", "foto3.jpg"];
  const fallbackImage = "logo.jpg";
  const intervalMs = 5000;
  const transitionMs = 550;

  let currentIndex = 0;
  let timeoutId = null;

  img.classList.remove("out", "in");
  img.src = frames[currentIndex];

  img.addEventListener("error", () => {
    img.src = fallbackImage;
  });

  function showNextFrame() {
    img.classList.add("out");

    window.setTimeout(() => {
      currentIndex = (currentIndex + 1) % frames.length;
      img.src = frames[currentIndex];

      img.classList.remove("out");
      img.classList.add("in");

      void img.offsetWidth; // reinicia animació
      img.classList.remove("in");

      timeoutId = window.setTimeout(showNextFrame, intervalMs);
    }, transitionMs);
  }

  timeoutId = window.setTimeout(showNextFrame, intervalMs);

  window.addEventListener("beforeunload", () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  });
}

/* =========================
   RESSENYES AMB LOCALSTORAGE
========================= */
function initReviews() {
  const STORAGE_KEY = "pitstop_reviews";
  const MAX_REVIEWS = 20;

  const form = document.getElementById("reviewForm");
  const reviewsList = document.getElementById("reviewsList");
  const stars = document.querySelectorAll(".stars span");
  const ratingInput = document.getElementById("rating");
  const nameInput = document.getElementById("name");

  if (!form || !reviewsList || !ratingInput || !nameInput || stars.length === 0) {
    return;
  }

  let reviews = loadReviews();

  function loadReviews() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error carregant ressenyes:", error);
      return [];
    }
  }

  function saveReviews() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (error) {
      console.error("Error guardant ressenyes:", error);
    }
  }

  function createStars(rating) {
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 0));
    return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
  }

  function renderReviews() {
    reviewsList.innerHTML = "";

    const orderedReviews = [...reviews].reverse();

    orderedReviews.forEach((review) => {
      const reviewItem = document.createElement("div");
      reviewItem.className = "review";

      const safeName = document.createElement("strong");
      safeName.textContent = review.name;

      const ratingText = document.createElement("span");
      ratingText.textContent = ` ${createStars(review.rating)}`;

      reviewItem.appendChild(safeName);
      reviewItem.appendChild(ratingText);

      reviewsList.appendChild(reviewItem);
    });
  }

  function updateStars(selectedValue) {
    stars.forEach((star) => {
      const starValue = Number(star.dataset.value);
      star.classList.toggle("active", starValue <= selectedValue);
    });
  }

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const value = Number(star.dataset.value) || 0;
      ratingInput.value = value;
      updateStars(value);
    });

    star.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const value = Number(star.dataset.value) || 0;
        ratingInput.value = value;
        updateStars(value);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim().slice(0, 30);
    const rating = Number(ratingInput.value);

    if (!name) {
      alert("Escriu el teu nom");
      nameInput.focus();
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      alert("Selecciona estrelles");
      return;
    }

    reviews.push({
      name,
      rating,
      ts: Date.now(),
    });

    if (reviews.length > MAX_REVIEWS) {
      reviews = reviews.slice(-MAX_REVIEWS);
    }

    saveReviews();
    form.reset();
    ratingInput.value = 0;
    updateStars(0);
    renderReviews();
  });

  renderReviews();
}
