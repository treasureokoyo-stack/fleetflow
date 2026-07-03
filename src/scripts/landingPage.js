// src/scripts/landingPage.js
export function initLandingPage() {
  // Bind CTA button "Browse Cars" to vehicles route
  const heroBrowseBtn = document.querySelector("main section button:nth-of-type(1)");
  if (heroBrowseBtn) {
    heroBrowseBtn.onclick = () => {
      location.hash = "#vehicles";
    };
  }

  // Bind CTA button "Check Availability" to vehicles route
  const heroAvailBtn = document.querySelector("main section button:nth-of-type(2)");
  if (heroAvailBtn) {
    heroAvailBtn.onclick = () => {
      location.hash = "#vehicles";
    };
  }

  // Bind Quick Search Widget "Search" button
  const searchBtn = document.querySelector("main section button:last-of-type");
  if (searchBtn) {
    searchBtn.onclick = () => {
      const typeSelect = document.querySelector("main section select");
      const categoryQuery = typeSelect ? typeSelect.value : "";
      if (categoryQuery && categoryQuery !== "All Categories") {
        location.hash = `#vehicles?category=${categoryQuery.toLowerCase()}`;
      } else {
        location.hash = "#vehicles";
      }
    };
  }

  // Bind "View full fleet" arrow link
  const viewFullLink = document.querySelector("main section a");
  if (viewFullLink) {
    viewFullLink.href = "#vehicles";
  }

  // Bind Featured Vehicle Cards
  const cards = document.querySelectorAll("main flex overflow-x-auto, main section .flex-grow");
  document.querySelectorAll("main section div.min-w-\\[300px\\]").forEach(card => {
    card.style.cursor = "pointer";
    card.onclick = () => {
      location.hash = "#vehicles";
    };
  });
}
