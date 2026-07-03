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
import { renderMyBookings } from "./scripts/myBookings.js";
import { renderBookingCheckout } from "./scripts/bookingCheckout.js";
import { initLandingPage } from "./scripts/landingPage.js";

const routes = {
  "#sign_in_fleetflow": { template: "src/pages/sign_in_fleetflow.html", init: null },
  "#sign_up_fleetflow": { template: "src/pages/sign_up_fleetflow.html", init: null },
  "#browse_fleet_fleetflow": { template: "src/pages/browse_fleet_fleetflow.html", init: renderVehicles },
  "#fleet_management_fleetflow_admin": { template: "src/pages/fleet_management_fleetflow_admin.html", init: null },
  "#fleet_management_with_availability_calendar_fleetflow_admin": { template: "src/pages/fleet_management_with_availability_calendar_fleetflow_admin.html", init: null },
  "#admin_overview_fleetflow": { template: "src/pages/admin_overview_fleetflow.html", init: null },
  "#admin_sign_in_fleetflow": { template: "src/pages/admin_sign_in_fleetflow.html", init: null },
  "#booking_management_fleetflow_admin": { template: "src/pages/booking_management_fleetflow_admin.html", init: null },
  "#my_bookings_fleetflow_dashboard": { template: "src/pages/my_bookings_fleetflow_dashboard.html", init: renderMyBookings },
  "#settings_fleetflow_admin": { template: "src/pages/settings_fleetflow_admin.html", init: null },
  "#account_settings_fleetflow": { template: "src/pages/account_settings_fleetflow.html", init: null },
  "#support_center_fleetflow": { template: "src/pages/support_center_fleetflow.html", init: null },
  "#fleetflow_rent_premium_cars": { template: "src/pages/fleetflow_rent_premium_cars.html", init: initLandingPage },
  "#tesla_model_s_fleetflow_details": { template: "src/pages/tesla_model_s_fleetflow_details.html", init: null },
  "#complete_your_booking_fleetflow": { template: "src/pages/complete_your_booking_fleetflow.html", init: renderBookingCheckout },
  "#dashboard": { template: "src/pages/dashboard.html", init: renderDashboard, secure: "CUSTOMER" },
  "": { template: "src/pages/fleetflow_rent_premium_cars.html", init: initLandingPage },
  "#vehicles": { template: "src/pages/browse_fleet_fleetflow.html", init: renderVehicles },
  "#vehicle-details": { template: "src/pages/vehicle-details.html", init: renderVehicleDetails },
  "#login": { template: "src/pages/login.html", init: renderLogin },
  "#register": { template: "src/pages/register.html", init: renderRegister },
  "#staff": { template: "src/pages/staff.html", init: renderStaff, secure: "STAFF" },
  "#admin": { template: "src/pages/admin.html", init: renderAdmin, secure: "ADMIN" }
};

export async function initRouter() {
  setupAuthHeader();

  async function loadPage() {
    const fullHash = location.hash || "";
    const [hashPath, queryString] = fullHash.split("?");
    const params = new URLSearchParams(queryString || "");
    const route = routes[hashPath] || routes[""];
    if (route.secure) {
      const isAuthorized = await checkAuthRoute(route.secure);
      if (!isAuthorized) {
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
        if (route.init) route.init(params);
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
  loadPage();
}
