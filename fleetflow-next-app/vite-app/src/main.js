// src/main.js
import './styles/main.css';
import './router.js';

// Create header with theme toggle
const header = document.createElement('header');
header.className = 'app-header';
header.innerHTML = `
  <h1 class="app-title">FleetFlow</h1>
  <button id="theme-toggle" class="theme-button" title="Toggle dark/light mode">&#xe3b0;</button>
`;

document.body.prepend(header);

// Create main content container
const main = document.createElement('main');
main.id = 'app-content';
main.className = 'app-main';
document.body.appendChild(main);

// Theme toggle logic (using Material Symbols)
const toggleBtn = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
function setTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
// Initialize theme based on system preference
setTheme(prefersDark.matches);
// Listen to system changes
prefersDark.addEventListener('change', (e) => setTheme(e.matches));
// Button click toggles theme
toggleBtn.addEventListener('click', () => {
  const isDark = document.documentElement.dataset.theme === 'dark';
  setTheme(!isDark);
});

// Initialize router on load and hash change
window.addEventListener('load', () => {
  window.dispatchEvent(new Event('hashchange'));
});
window.addEventListener('hashchange', () => {
  // router will handle page loading
  // imported router.js registers its handler on hashchange
});

import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
<section id="center">
  <div class="hero">
    <img src="${heroImg}" class="base" width="170" height="179">
    <img src="${javascriptLogo}" class="framework" alt="JavaScript logo"/>
    <img src="${viteLogo}" class="vite" alt="Vite logo" />
  </div>
  <div>
    <h1>Get started</h1>
    <p>Edit <code>src/main.js</code> and save to test <code>HMR</code></p>
  </div>
  <button id="counter" type="button" class="counter"></button>
</section>

<div class="ticks"></div>

<section id="next-steps">
  <div id="docs">
    <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#documentation-icon"></use></svg>
    <h2>Documentation</h2>
    <p>Your questions, answered</p>
    <ul>
      <li>
        <a href="https://vite.dev/" target="_blank">
          <img class="logo" src="${viteLogo}" alt="" />
          Explore Vite
        </a>
      </li>
      <li>
        <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
          <img class="button-icon" src="${javascriptLogo}" alt="">
          Learn more
        </a>
      </li>
    </ul>
  </div>
  <div id="social">
    <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#social-icon"></use></svg>
    <h2>Connect with us</h2>
    <p>Join the Vite community</p>
    <ul>
      <li><a href="https://github.com/vitejs/vite" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>GitHub</a></li>
      <li><a href="https://chat.vite.dev/" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#discord-icon"></use></svg>Discord</a></li>
      <li><a href="https://x.com/vite_js" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#x-icon"></use></svg>X.com</a></li>
      <li><a href="https://bsky.app/profile/vite.dev" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#bluesky-icon"></use></svg>Bluesky</a></li>
    </ul>
  </div>
</section>

<div class="ticks"></div>
<section id="spacer"></section>
`

setupCounter(document.querySelector('#counter'))
