// src/scripts/vehicles.js
import { api } from "./api.js";
import { createVehicleCard } from "./home.js";

let allVehicles = [];
let currentPage = 1;
const itemsPerPage = 12;

export async function renderVehicles(params) {
  const grid = document.getElementById("catalog-vehicles-grid");
  if (!grid) return;

  // Initialize event listeners for filtering
  setupFilterListeners();

  // If a category was passed in hash parameters (e.g. from footer link), pre-check it
  const preSelectedCat = params.get("category");
  if (preSelectedCat) {
    const checkboxes = document.querySelectorAll(".filter-category-checkbox");
    checkboxes.forEach(cb => {
      if (cb.value.toLowerCase() === preSelectedCat.toLowerCase()) {
        cb.checked = true;
      }
    });
  }

  try {
    allVehicles = await api.get("/api/vehicles");
    applyFiltersAndRender();
  } catch (err) {
    console.error("Failed to load catalog vehicles:", err);
    grid.innerHTML = `
      <div class="col-span-12 py-16 text-center" style="color: var(--color-error);">
        <p>Failed to load vehicles catalog.</p>
      </div>
    `;
  }
}

function setupFilterListeners() {
  const searchInput = document.getElementById("filter-search");
  const minPrice = document.getElementById("filter-price-min");
  const maxPrice = document.getElementById("filter-price-max");
  const availableOnly = document.getElementById("filter-available-only");
  const sortSelector = document.getElementById("sort-selector");
  const clearBtn = document.getElementById("btn-clear-filters");

  const inputs = [searchInput, minPrice, maxPrice, availableOnly, sortSelector];
  inputs.forEach(input => {
    if (input) {
      input.addEventListener("input", () => {
        currentPage = 1;
        applyFiltersAndRender();
      });
      input.addEventListener("change", () => {
        currentPage = 1;
        applyFiltersAndRender();
      });
    }
  });

  // Checkbox listeners
  document.querySelectorAll(".filter-category-checkbox, .filter-trans-checkbox").forEach(cb => {
    cb.addEventListener("change", () => {
      currentPage = 1;
      applyFiltersAndRender();
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (minPrice) minPrice.value = "";
      if (maxPrice) maxPrice.value = "";
      if (availableOnly) availableOnly.checked = false;
      if (sortSelector) sortSelector.value = "featured";

      document.querySelectorAll(".filter-category-checkbox, .filter-trans-checkbox").forEach(cb => {
        cb.checked = false;
      });

      currentPage = 1;
      applyFiltersAndRender();
    });
  }
}

function applyFiltersAndRender() {
  const grid = document.getElementById("catalog-vehicles-grid");
  const countLabel = document.getElementById("vehicles-count-label");
  if (!grid) return;

  // 1. Gather filter criteria
  const search = (document.getElementById("filter-search")?.value || "").toLowerCase().trim();
  
  const selectedCategories = Array.from(document.querySelectorAll(".filter-category-checkbox:checked"))
    .map(cb => cb.value.toLowerCase());
    
  const selectedTransmissions = Array.from(document.querySelectorAll(".filter-trans-checkbox:checked"))
    .map(cb => cb.value.toLowerCase());

  const minPrice = parseFloat(document.getElementById("filter-price-min")?.value) || 0;
  const maxPrice = parseFloat(document.getElementById("filter-price-max")?.value) || Infinity;
  const availableOnly = document.getElementById("filter-available-only")?.checked || false;
  const sortBy = document.getElementById("sort-selector")?.value || "featured";

  // 2. Filter data
  let filtered = allVehicles.filter(v => {
    // Search match (name, brand, model)
    const nameMatch = v.name.toLowerCase().includes(search) || 
                      v.brand.toLowerCase().includes(search) || 
                      v.model.toLowerCase().includes(search);
                      
    // Category match
    const catMatch = selectedCategories.length === 0 || selectedCategories.includes(v.category.toLowerCase());
    
    // Transmission match
    const transMatch = selectedTransmissions.length === 0 || selectedTransmissions.includes(v.transmission.toLowerCase());
    
    // Price match
    const priceMatch = v.daily_rate >= minPrice && v.daily_rate <= maxPrice;
    
    // Availability match
    const availMatch = !availableOnly || v.status === "AVAILABLE";

    return nameMatch && catMatch && transMatch && priceMatch && availMatch;
  });

  // 3. Sort data
  if (sortBy === "price-asc") {
    filtered.sort((a, b) => a.daily_rate - b.daily_rate);
  } else if (sortBy === "price-desc") {
    filtered.sort((a, b) => b.daily_rate - a.daily_rate);
  } else if (sortBy === "name-asc") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  // 4. Update count label
  if (countLabel) {
    countLabel.textContent = `Showing ${filtered.length} vehicles`;
  }

  // 5. Pagination math
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  // 6. Render list
  if (paginated.length === 0) {
    grid.innerHTML = `
      <div class="col-span-12 py-16 text-center">
        <div class="empty-state">
          <div class="empty-icon">🚗</div>
          <h3>No Vehicles Found</h3>
          <p>No vehicles match your selected filter criteria. Try expanding your parameters.</p>
        </div>
      </div>
    `;
    document.getElementById("catalog-pagination").innerHTML = "";
    return;
  }

  grid.innerHTML = paginated.map(v => createVehicleCard(v)).join("");
  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  const container = document.getElementById("catalog-pagination");
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? "active" : "";
    html += `<button class="page-btn ${activeClass}" data-page="${i}">${i}</button>`;
  }

  container.innerHTML = html;

  // Page click handlers
  container.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      currentPage = parseInt(e.target.getAttribute("data-page"));
      applyFiltersAndRender();
      // Scroll to catalog top smoothly
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}
