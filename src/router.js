// src/router.js
import { initTheme } from "./scripts/darkMode.js";
import { setupAuthHeader, checkAuthRoute } from "./scripts/auth.js";
import { renderHome } from "./scripts/home.js";
import { renderVehicles } from "./scripts/vehicles.js";
import { renderVehicleDetails } from "./scripts/vehicleDetails.js";
import { renderLogin, renderRegister } from "./scripts/auth.js";
import { renderDashboard } from "./scripts/dashboard.js";
import { renderStaff } from "./scripts/staff.js";
import { renderAdmin } from "./scripts/admin.js";

const routes = {
  "": { template: "src/pages/home.html", init: renderHome },
  "#vehicles": { template: "src/pages/vehicles.html", init: renderVehicles },
  "#vehicle-details": { template: "src/pages/vehicle-details.html", init: renderVehicleDetails },
  "#login": { template: "src/pages/login.html", init: renderLogin },
  "#register": { template: "src/pages/register.html", init: renderRegister },
  "#dashboard": { template: "src/pages/dashboard.html", init: renderDashboard, secure: "CUSTOMER" },
  "#staff": { template: "src/pages/staff.html", init: renderStaff, secure: "STAFF" },
  "#admin": { template: "src/pages/admin.html", init: renderAdmin, secure: "ADMIN" }
};

export async function initRouter() {
  setupAuthHeader();

  async function loadPage() {
    const fullHash = location.hash || "";
    // Separate hash path from query parameters
    const [hashPath, queryString] = fullHash.split("?");
    const params = new URLSearchParams(queryString || "");

    const route = routes[hashPath] || routes[""];
    
    // Check security / role permissions
    if (route.secure) {
      const isAuthorized = await checkAuthRoute(route.secure);
      if (!isAuthorized) {
        // Redirect to login or show 403 unauthorized page
        location.hash = "#login";
        return;
      }
    }

    try {
      const res = await fetch(route.template);
      if (!res.ok) throw new Error("Page not found");
      const html = await res.text();
      
      const appContent = document.getElementById("app-content");
      if (appContent) {
        appContent.innerHTML = html;
        // Run page-specific initialization scripts
        if (route.init) {
          route.init(params);
        }
      }
    } catch (err) {
      console.error(err);
      const appContent = document.getElementById("app-content");
      if (appContent) {
        appContent.innerHTML = `
          <div class="container py-16 text-center">
            <div class="empty-state">
              <div class="empty-icon">⚠️</div>
              <h3>An Error Occurred</h3>
              <p>${err.message || "Failed to load page. Please try again."}</p>
              <a href="#" class="btn btn-primary mt-4">Go Home</a>
            </div>
          </div>
        `;
      }
    }
  }

  window.addEventListener("hashchange", loadPage);
  // Run on initial load
  loadPage();
}
