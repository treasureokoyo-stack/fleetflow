// src/main.js
import { initRouter } from "./router.js";
import { initTheme } from "./scripts/darkMode.js";

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
  initTheme();
});
