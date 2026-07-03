// src/loadHtml.js
/**
 * Fetches an HTML file from the design directory and returns its content as a string.
 * Strips Tailwind CDN script tags and the Tailwind config script to keep the app lightweight.
 */
export async function loadHtml(path) {
  const response = await fetch(path);
  let html = await response.text();
  // Remove Tailwind CDN script
  html = html.replace(/<script[^>]*src=["'].*tailwindcss\.com.*["'][^>]*><\/script>/gi, "");
  // Remove Tailwind config script block
  html = html.replace(/<script id=["']tailwind-config["'][^>]*>[^<]*<\/script>/gis, "");
  return html;
}
