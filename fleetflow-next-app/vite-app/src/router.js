// src/router.js
// Simple hash-based router loading page fragments from public/pages into #app-content

function loadPage(page) {
  const contentDiv = document.getElementById('app-content');
  if (!contentDiv) return;
  const pageMap = {
    'sign-in': '/pages/sign-in.html',
    'sign-up': '/pages/sign-up.html',
    'catalog': '/pages/catalog.html',
  };
  const url = pageMap[page] || pageMap['sign-in'];
  fetch(url)
    .then((resp) => resp.ok ? resp.text() : Promise.reject('404'))
    .then((html) => { contentDiv.innerHTML = html; })
    .catch(() => { contentDiv.innerHTML = '<p>Page not found</p>'; });
}

window.addEventListener('hashchange', () => {
  const hash = location.hash.replace('#', '');
  loadPage(hash);
});

// Initial load based on current hash or default to sign-in
const initial = location.hash.replace('#', '') || 'sign-in';
loadPage(initial);

