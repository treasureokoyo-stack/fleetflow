// src/scripts/home.js
import { api } from "./api.js";

export async function renderHome() {
  const featuredGrid = document.getElementById("featured-vehicles-grid");
  if (!featuredGrid) return;

  try {
    const vehicles = await api.get("/api/vehicles");
    // Show only first 3 as featured
    const featuredList = vehicles.slice(0, 3);

    if (featuredList.length === 0) {
      featuredGrid.innerHTML = `
        <div class="col-span-12 py-8 text-center" style="color: var(--color-muted);">
          <h3>No Vehicles Available</h3>
          <p>We are updating our catalog. Please check back later!</p>
        </div>
      `;
      return;
    }

    featuredGrid.innerHTML = featuredList.map(v => createVehicleCard(v)).join("");
  } catch (err) {
    console.error("Failed to load featured vehicles:", err);
    featuredGrid.innerHTML = `
      <div class="col-span-12 py-8 text-center" style="color: var(--color-error);">
        <p>Failed to load featured vehicles.</p>
      </div>
    `;
  }
}

export function createVehicleCard(v) {
  const statusClass = v.status === "AVAILABLE" ? "badge-success" : 
                      v.status === "BOOKED" ? "badge-warning" : "badge-muted";
  
  // Set placeholder if not provided
  const imgUrl = v.thumbnail_url || "/vehicle_placeholder.png";

  return `
    <div class="col-span-4 md-col-span-6 card vehicle-card" onclick="location.hash='#vehicle-details?id=${v.id}'">
      <img src="${imgUrl}" alt="${v.name}" class="card-img" onerror="this.src='/vehicle_placeholder.png';" />
      <div class="card-body">
        <div class="flex justify-between items-center mb-2">
          <h3 class="card-title" style="margin: 0;">${v.name}</h3>
          <span class="badge ${statusClass}">${v.status}</span>
        </div>
        <p class="card-category">${v.category}</p>
        <div class="card-specs">
          <span class="spec-tag">⚙️ ${v.transmission}</span>
          <span class="spec-tag">👥 ${v.seat_count} Seats</span>
          <span class="spec-tag">⛽ ${v.fuel_type || "Electric"}</span>
        </div>
        <div class="flex justify-between items-center mt-6">
          <div class="card-price">$${v.daily_rate}<span>/ day</span></div>
          <span class="btn btn-accent btn-sm">View Details</span>
        </div>
      </div>
    </div>
  `;
}
