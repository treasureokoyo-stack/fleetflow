// src/scripts/vehicleDetails.js
import { api, getUserInfo } from "./api.js";

let currentVehicle = null;

export async function renderVehicleDetails(params) {
  const vehicleId = params.get("id");
  if (!vehicleId) {
    location.hash = "#vehicles";
    return;
  }

  try {
    currentVehicle = await api.get(`/api/vehicles/${vehicleId}`);
    populateVehicleDetails(currentVehicle);
    setupBookingWidget(currentVehicle);
  } catch (err) {
    console.error("Failed to load vehicle details:", err);
    const container = document.getElementById("vehicle-detail-container");
    if (container) {
      container.innerHTML = `
        <div class="col-span-12 py-16 text-center" style="color: var(--color-error);">
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h3>Vehicle Not Found</h3>
            <p>${err.message || "This vehicle no longer exists or is unavailable."}</p>
            <a href="#vehicles" class="btn btn-primary mt-4">Back to Fleet</a>
          </div>
        </div>
      `;
    }
  }
}

function populateVehicleDetails(v) {
  const mainImg = document.getElementById("detail-main-img");
  const nameLabel = document.getElementById("detail-name");
  const brandModelLabel = document.getElementById("detail-brand-model");
  const statusBadge = document.getElementById("detail-status-badge");
  const transLabel = document.getElementById("detail-transmission");
  const fuelLabel = document.getElementById("detail-fuel");
  const seatsLabel = document.getElementById("detail-seats");
  const yearCatLabel = document.getElementById("detail-year-cat");
  const descLabel = document.getElementById("detail-description");
  const featuresContainer = document.getElementById("detail-features-tags");

  if (mainImg) mainImg.src = v.thumbnail_url || "/vehicle_placeholder.png";
  if (nameLabel) nameLabel.textContent = v.name;
  if (brandModelLabel) brandModelLabel.textContent = `${v.brand} • ${v.model}`;
  
  if (statusBadge) {
    statusBadge.textContent = v.status;
    statusBadge.className = "badge"; // reset classes
    const statusClass = v.status === "AVAILABLE" ? "badge-success" : 
                        v.status === "BOOKED" ? "badge-warning" : "badge-muted";
    statusBadge.classList.add(statusClass);
  }

  if (transLabel) transLabel.textContent = v.transmission;
  if (fuelLabel) fuelLabel.textContent = v.fuel_type || "Electric";
  if (seatsLabel) seatsLabel.textContent = `${v.seat_count} Seats`;
  if (yearCatLabel) yearCatLabel.textContent = `${v.year} • ${v.category}`;
  if (descLabel) descLabel.textContent = v.description;

  // Build image gallery thumbnails
  const thumbsGrid = document.getElementById("detail-thumbnails");
  if (thumbsGrid) {
    thumbsGrid.innerHTML = "";
    
    // Add primary thumbnail first
    const images = [v.thumbnail_url, ...(v.images || []).map(img => img.image_url)].filter(Boolean);
    
    if (images.length > 0) {
      thumbsGrid.innerHTML = images.map((img, idx) => `
        <div class="thumbnail-item ${idx === 0 ? 'active' : ''}" data-url="${img}">
          <img src="${img}" alt="Thumbnail" onerror="this.src='/vehicle_placeholder.png';" />
        </div>
      `).join("");

      // Gallery thumb click behavior
      thumbsGrid.querySelectorAll(".thumbnail-item").forEach(item => {
        item.addEventListener("click", (e) => {
          thumbsGrid.querySelectorAll(".thumbnail-item").forEach(el => el.classList.remove("active"));
          const thumb = e.currentTarget;
          thumb.classList.add("active");
          if (mainImg) mainImg.src = thumb.getAttribute("data-url");
        });
      });
    }
  }
}

function setupBookingWidget(v) {
  const priceLabel = document.getElementById("widget-price");
  const widgetStatus = document.getElementById("widget-status-badge");
  const pickupInput = document.getElementById("pickup-date");
  const returnInput = document.getElementById("return-date");
  const breakdownContainer = document.getElementById("booking-breakdown");
  const errorAlert = document.getElementById("booking-error-alert");
  const bookingForm = document.getElementById("booking-form");

  if (priceLabel) priceLabel.textContent = `$${v.daily_rate}`;
  if (widgetStatus) {
    widgetStatus.textContent = v.status;
    widgetStatus.className = "badge";
    const statusClass = v.status === "AVAILABLE" ? "badge-success" : 
                        v.status === "BOOKED" ? "badge-warning" : "badge-muted";
    widgetStatus.classList.add(statusClass);
  }

  // Set min dates to today
  const todayStr = new Date().toISOString().split("T")[0];
  if (pickupInput) {
    pickupInput.min = todayStr;
    pickupInput.addEventListener("change", handleDateChange);
  }
  if (returnInput) {
    returnInput.addEventListener("change", handleDateChange);
  }

  function handleDateChange() {
    const pickupVal = pickupInput.value;
    const returnVal = returnInput.value;

    if (errorAlert) errorAlert.style.display = "none";

    if (!pickupVal || !returnVal) {
      if (breakdownContainer) breakdownContainer.style.display = "none";
      return;
    }

    const pickupDate = new Date(pickupVal);
    const returnDate = new Date(returnVal);
    
    // Set return input min value to pick up date + 1 day
    returnInput.min = new Date(pickupDate.getTime() + 86400000).toISOString().split("T")[0];

    // Compute diff
    const diffTime = returnDate.getTime() - pickupDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      if (breakdownContainer) breakdownContainer.style.display = "none";
      return;
    }

    // Min 1 day, Max 60 days validation
    if (diffDays > 60) {
      showError("Maximum rental duration is 60 days.");
      return;
    }

    // Update Live breakdown
    const totalAmount = v.daily_rate * diffDays;
    
    const daysLabel = document.getElementById("breakdown-days-label");
    const subtotalLabel = document.getElementById("breakdown-subtotal");
    const totalLabel = document.getElementById("breakdown-total");

    if (daysLabel) daysLabel.textContent = `$${v.daily_rate} x ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (subtotalLabel) subtotalLabel.textContent = `$${totalAmount.toFixed(2)}`;
    if (totalLabel) totalLabel.textContent = `$${totalAmount.toFixed(2)}`;
    
    if (breakdownContainer) breakdownContainer.style.display = "flex";
  }

  function showError(msg) {
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.style.display = "block";
    }
  }

  // Handle Submission
  if (bookingForm) {
    // Clean old listener
    const newForm = bookingForm.cloneNode(true);
    bookingForm.parentNode.replaceChild(newForm, bookingForm);

    // Rebind dates since they got cloned
    const newPickup = document.getElementById("pickup-date");
    const newReturn = document.getElementById("return-date");
    newPickup.min = todayStr;
    newPickup.addEventListener("change", handleDateChange);
    newReturn.addEventListener("change", handleDateChange);

    newForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const user = getUserInfo();
      if (!user) {
        // Redirect unauthorized users to login
        location.hash = "#login";
        return;
      }

      const pickupVal = newPickup.value;
      const returnVal = newReturn.value;
      const widgetError = document.getElementById("booking-error-alert");

      if (widgetError) widgetError.style.display = "none";

      const pickupDate = new Date(pickupVal);
      const returnDate = new Date(returnVal);
      const diffTime = returnDate.getTime() - pickupDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        alert("Return date must be after pickup date.");
        return;
      }

      try {
        const result = await api.post("/api/bookings", {
          vehicle_id: v.id,
          pickup_date: pickupVal,
          return_date: returnVal
        });
        
        alert(`Booking created successfully! Reference: ${result.booking_reference}`);
        location.hash = "#dashboard";
      } catch (err) {
        if (widgetError) {
          widgetError.textContent = err.message || "This vehicle is unavailable for the selected dates.";
          widgetError.style.display = "block";
        }
      }
    });
  }
}
