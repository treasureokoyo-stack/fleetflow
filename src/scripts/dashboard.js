// src/scripts/dashboard.js
import { api, getUserInfo, setUserInfo } from "./api.js";

export async function renderDashboard() {
  const user = getUserInfo();
  if (!user) {
    location.hash = "#login";
    return;
  }

  // Greeting
  const welcomeMsg = document.getElementById("dashboard-welcome-msg");
  if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${user.first_name} ${user.last_name}`;

  setupDashboardTabs();
  
  // Load bookings stats & list
  await loadCustomerBookings();
  
  // Fill profile fields
  populateProfileForm(user);
}

function setupDashboardTabs() {
  const btnBookings = document.getElementById("sidebar-tab-bookings");
  const btnProfile = document.getElementById("sidebar-tab-profile");
  const panelBookings = document.getElementById("panel-bookings");
  const panelProfile = document.getElementById("panel-profile");

  if (btnBookings && btnProfile && panelBookings && panelProfile) {
    btnBookings.onclick = () => {
      btnBookings.classList.add("active");
      btnProfile.classList.remove("active");
      panelBookings.classList.add("active");
      panelProfile.classList.remove("active");
    };

    btnProfile.onclick = () => {
      btnProfile.classList.add("active");
      btnBookings.classList.remove("active");
      panelProfile.classList.add("active");
      panelBookings.classList.remove("active");
    };
  }
}

async function loadCustomerBookings() {
  const tbody = document.getElementById("bookings-tbody");
  const tableContainer = document.getElementById("bookings-table-container");
  const emptyState = document.getElementById("bookings-empty-state");
  
  if (!tbody) return;

  try {
    const bookings = await api.get("/api/bookings/my-bookings");
    
    // Calculate metrics
    let total = bookings.length;
    let active = bookings.filter(b => b.status === "CONFIRMED" || b.status === "PENDING").length;
    let completed = bookings.filter(b => b.status === "COMPLETED").length;
    let cancelled = bookings.filter(b => b.status === "CANCELLED").length;

    document.getElementById("stats-total").textContent = total;
    document.getElementById("stats-active").textContent = active;
    document.getElementById("stats-completed").textContent = completed;
    document.getElementById("stats-cancelled").textContent = cancelled;

    if (total === 0) {
      if (tableContainer) tableContainer.style.display = "none";
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    if (tableContainer) tableContainer.style.display = "block";
    if (emptyState) emptyState.style.display = "none";

    tbody.innerHTML = bookings.map(b => {
      const statusClass = b.status === "CONFIRMED" ? "badge-success" : 
                          b.status === "PENDING" ? "badge-warning" : 
                          b.status === "COMPLETED" ? "badge-info" : "badge-error";
      
      const pickupStr = new Date(b.pickup_date).toLocaleDateString();
      const returnStr = new Date(b.return_date).toLocaleDateString();

      // Cancel button action allowed for PENDING / CONFIRMED
      const canCancel = b.status === "PENDING" || b.status === "CONFIRMED";
      const actionHtml = canCancel ? 
        `<button class="btn btn-secondary btn-sm btn-cancel-booking" data-id="${b.id}">Cancel</button>` : "";

      return `
        <tr>
          <td style="font-family: monospace; font-weight: bold;">${b.booking_reference}</td>
          <td>${b.vehicle.name}</td>
          <td>${pickupStr} - ${returnStr} <span style="font-size: 11px; color: var(--color-muted);">(${b.total_days} days)</span></td>
          <td><span class="badge ${statusClass}">${b.status}</span></td>
          <td style="font-weight: 600;">$${parseFloat(b.total_amount).toFixed(2)}</td>
          <td style="text-align: right;">${actionHtml}</td>
        </tr>
      `;
    }).join("");

    // Hook cancel event
    tbody.querySelectorAll(".btn-cancel-booking").forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.getAttribute("data-id");
        if (confirm("Are you sure you want to cancel this booking?")) {
          try {
            await api.put(`/api/bookings/${id}/status`, { status: "CANCELLED" });
            alert("Booking cancelled successfully.");
            await loadCustomerBookings(); // refresh
          } catch (err) {
            alert(err.message || "Failed to cancel booking.");
          }
        }
      };
    });

  } catch (err) {
    console.error("Failed to load customer bookings:", err);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--color-error);">Failed to load bookings list.</td>
      </tr>
    `;
  }
}

function populateProfileForm(user) {
  const firstNameInput = document.getElementById("profile-first-name");
  const lastNameInput = document.getElementById("profile-last-name");
  const emailInput = document.getElementById("profile-email");
  const phoneInput = document.getElementById("profile-phone");
  const spendLabel = document.getElementById("profile-total-spend");
  const roleLabel = document.getElementById("profile-role");
  const form = document.getElementById("profile-update-form");

  if (firstNameInput) firstNameInput.value = user.first_name || "";
  if (lastNameInput) lastNameInput.value = user.last_name || "";
  if (emailInput) emailInput.value = user.email || "";
  if (phoneInput) phoneInput.value = user.phone || "";
  if (roleLabel) roleLabel.textContent = user.role || "CUSTOMER";

  // Load user total spending
  api.get("/api/users/spending").then(res => {
    if (spendLabel) spendLabel.textContent = `$${parseFloat(res.totalSpending || 0).toFixed(2)}`;
  }).catch(() => {
    if (spendLabel) spendLabel.textContent = "$0.00";
  });

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const profileAlert = document.getElementById("profile-alert");
      if (profileAlert) profileAlert.style.display = "none";

      try {
        const updated = await api.put("/api/users/profile", {
          first_name: firstNameInput.value.trim(),
          last_name: lastNameInput.value.trim(),
          phone: phoneInput.value.trim()
        });

        // Save updated local info
        setUserInfo(updated);
        
        // Update top-right display name
        const displayName = document.getElementById("user-display-name");
        if (displayName) displayName.textContent = `${updated.first_name} ${updated.last_name}`;

        if (profileAlert) {
          profileAlert.textContent = "Profile updated successfully.";
          profileAlert.className = "alert alert-success";
          profileAlert.style.display = "block";
        }
      } catch (err) {
        if (profileAlert) {
          profileAlert.textContent = err.message || "Failed to update profile details.";
          profileAlert.className = "alert alert-error";
          profileAlert.style.display = "block";
        }
      }
    };
  }
}
