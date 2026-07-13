// src/router.js
import { setupAuthHeader, checkAuthRoute } from "./scripts/auth.js";
import { renderHome } from "./scripts/home.js";
import { renderVehicles } from "./scripts/vehicles.js";
import { renderVehicleDetails } from "./scripts/vehicleDetails.js";
import { renderLogin, renderRegister } from "./scripts/auth.js";
import { renderDashboard } from "./scripts/dashboard.js";
import { renderStaff } from "./scripts/staff.js";
import { renderAdmin } from "./scripts/admin.js";
import { renderBookingCheckout } from "./scripts/bookingCheckout.js";
import { initLandingPage } from "./scripts/landingPage.js";

// My bookings re-uses dashboard rendering logic
const renderMyBookings = renderDashboard;

const routes = {
  // --- Landing / Home ---
  "":                                          { template: "src/pages/fleetflow_rent_premium_cars.html", init: initLandingPage },
  "#fleetflow_rent_premium_cars":              { template: "src/pages/fleetflow_rent_premium_cars.html", init: initLandingPage },

  // --- Fleet / Vehicles ---
  "#browse_fleet_fleetflow":                   { template: "src/pages/browse_fleet_fleetflow.html",      init: renderVehicles },
  "#vehicles":                                 { template: "src/pages/browse_fleet_fleetflow.html",      init: renderVehicles },

  // --- Vehicle Detail ---
  "#tesla_model_s_fleetflow_details":          { template: "src/pages/tesla_model_s_fleetflow_details.html", init: renderVehicleDetails },
  "#vehicle-details":                          { template: "src/pages/tesla_model_s_fleetflow_details.html", init: renderVehicleDetails },

  // --- Booking ---
  "#complete_your_booking_fleetflow":          { template: "src/pages/complete_your_booking_fleetflow.html", init: renderBookingCheckout },

  // --- Auth ---
  "#sign_in_fleetflow":                        { template: "src/pages/sign_in_fleetflow.html",           init: renderLogin },
  "#login":                                    { template: "src/pages/sign_in_fleetflow.html",           init: renderLogin },
  "#sign_up_fleetflow":                        { template: "src/pages/sign_up_fleetflow.html",           init: renderRegister },
  "#register":                                 { template: "src/pages/sign_up_fleetflow.html",           init: renderRegister },

  // --- Customer Dashboard ---
  "#my_bookings_fleetflow_dashboard":          { template: "src/pages/my_bookings_fleetflow_dashboard.html", init: renderMyBookings, secure: "CUSTOMER" },
  "#dashboard":                                { template: "src/pages/my_bookings_fleetflow_dashboard.html", init: renderMyBookings, secure: "CUSTOMER" },

  // --- Account ---
  "#account_settings_fleetflow":               { template: "src/pages/account_settings_fleetflow.html", init: null },
  "#support_center_fleetflow":                 { template: "src/pages/support_center_fleetflow.html",   init: null },

  // --- Admin ---
  "#admin_overview_fleetflow":                 { template: "src/pages/admin_overview_fleetflow.html",   init: renderAdmin, secure: "ADMIN" },
  "#admin":                                    { template: "src/pages/admin_overview_fleetflow.html",   init: renderAdmin, secure: "ADMIN" },
  "#admin_sign_in_fleetflow":                  { template: "src/pages/admin_sign_in_fleetflow.html",    init: null },
  "#fleet_management_fleetflow_admin":         { template: "src/pages/fleet_management_fleetflow_admin.html",                            init: renderAdmin, secure: "ADMIN" },
  "#fleet_management_with_availability_calendar_fleetflow_admin": { template: "src/pages/fleet_management_with_availability_calendar_fleetflow_admin.html", init: renderAdmin, secure: "ADMIN" },
  "#booking_management_fleetflow_admin":       { template: "src/pages/booking_management_fleetflow_admin.html", init: renderAdmin, secure: "ADMIN" },
  "#settings_fleetflow_admin":                 { template: "src/pages/settings_fleetflow_admin.html",  init: renderAdmin, secure: "ADMIN" },

  // --- Staff ---
  "#staff":                                    { template: "src/pages/staff.html",                     init: renderStaff, secure: "STAFF" },
};

/**
 * Parse a full design HTML document and return:
 *  - bodyHTML:    inner HTML of <body>
 *  - bodyClasses: class attribute of <body> (so we can apply it to document.body)
 *  - styleBlocks: page-specific <style> content from <head>
 */
function parseDesignPage(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  // Extract inline styles from <head> (but not CDN <link>/<script> tags)
  const styleBlocks = Array.from(doc.querySelectorAll("head style"))
    .map(s => s.textContent)
    .join("\n");

  const bodyEl = doc.body;
  const bodyHTML    = bodyEl ? bodyEl.innerHTML : rawHtml;
  const bodyClasses = bodyEl ? (bodyEl.getAttribute("class") || "") : "";

  return { bodyHTML, bodyClasses, styleBlocks };
}

/**
 * Re-execute any <script> tags inserted via innerHTML
 * (browsers deliberately skip them for security, so we need to clone them).
 */
function activateInlineScripts(container) {
  container.querySelectorAll("script").forEach(oldScript => {
    // Skip CDN scripts already present globally
    if (oldScript.src && (
      oldScript.src.includes("tailwindcss") ||
      oldScript.src.includes("fonts.googleapis") ||
      oldScript.src.includes("fonts.gstatic")
    )) {
      oldScript.remove();
      return;
    }
    const newScript = document.createElement("script");
    Array.from(oldScript.attributes).forEach(attr =>
      newScript.setAttribute(attr.name, attr.value)
    );
    newScript.textContent = oldScript.textContent;
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}

export async function initRouter() {
  setupAuthHeader();

  const pageStyleEl = document.getElementById("ff-page-styles");
  const loadingEl   = document.getElementById("ff-loading");
  const appContent  = document.getElementById("app-content");

  // Track the last body classes we applied so we can remove them cleanly
  let lastBodyClasses = "";

  function showLoading() {
    if (loadingEl) loadingEl.classList.add("active");
  }
  function hideLoading() {
    if (loadingEl) loadingEl.classList.remove("active");
  }

  async function loadPage() {
    const fullHash = location.hash || "";
    const [hashPath, queryString] = fullHash.split("?");
    const params = new URLSearchParams(queryString || "");
    const route  = routes[hashPath] || routes[""];

    // Auth guard
    if (route.secure) {
      const isAuthorized = await checkAuthRoute(route.secure);
      if (!isAuthorized) {
        location.hash = "#login";
        return;
      }
    }

    if (!appContent) return;

    showLoading();

    try {
      const res = await fetch(route.template + "?t=" + Date.now());
      if (!res.ok) throw new Error(`Could not load page: ${route.template} (${res.status})`);
      const rawHtml = await res.text();

      const { bodyHTML, bodyClasses, styleBlocks } = parseDesignPage(rawHtml);

      // ── 1. Apply page-specific styles ──────────────────────────────────
      if (pageStyleEl) {
        pageStyleEl.textContent = styleBlocks || "";
      }

      // ── 2. Apply body classes from the design page ─────────────────────
      // Remove old page's body classes first
      if (lastBodyClasses) {
        lastBodyClasses.split(/\s+/).forEach(cls => {
          if (cls) document.body.classList.remove(cls);
        });
      }
      // Add new page's body classes
      if (bodyClasses) {
        bodyClasses.split(/\s+/).forEach(cls => {
          if (cls) document.body.classList.add(cls);
        });
      }
      lastBodyClasses = bodyClasses;

      // ── 3. Render body content ─────────────────────────────────────────
      appContent.innerHTML = bodyHTML;

      // ── 4. Re-execute inline scripts ───────────────────────────────────
      activateInlineScripts(appContent);

      // ── 5. Scroll to top ───────────────────────────────────────────────
      window.scrollTo({ top: 0, behavior: "instant" });

      // ── 6. Run page-specific init function ─────────────────────────────
      if (route.init) {
        try {
          route.init(params);
        } catch (e) {
          console.warn("[Router] Page init error:", e);
        }
      }
    } catch (err) {
      console.error("[Router] Load error:", err);
      appContent.innerHTML = `
        <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Inter,sans-serif;padding:2rem;text-align:center;background:#fcf8fa;">
          <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
          <h2 style="font-size:1.5rem;font-weight:600;margin-bottom:0.5rem;color:#1b1b1d;">Page could not be loaded</h2>
          <p style="color:#76777d;margin-bottom:1.5rem;max-width:400px;">${err.message}</p>
          <a href="#" style="background:#131b2e;color:#fff;padding:0.75rem 2rem;border-radius:0.5rem;text-decoration:none;font-weight:500;display:inline-block;">↩ Go Home</a>
        </div>
      `;
    } finally {
      hideLoading();
    }
  }

  window.addEventListener("hashchange", loadPage);
  loadPage();
}
