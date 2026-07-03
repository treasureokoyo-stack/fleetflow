// src/main.js
import "@design/main.css";
import { initRouter } from "./router.js";
import { initTheme } from "./scripts/darkMode.js";

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
  initTheme();
});
