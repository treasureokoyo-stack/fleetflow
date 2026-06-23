// src/scripts/staff.js
import { api } from "./api.js";

let allBookings = [];
let allCustomers = [];

export async function renderStaff() {
  setupStaffTabs();
  
  // Set up filters & searches
  setupStaffListeners();

  // Load Initial Data
  await loadStaffBookings();
  await loadStaffCustomers();
}

function setupStaffTabs() {
  const tabBookings = document.getElementById("staff-tab-bookings");
  const tabCustomers = document.getElementById("staff-tab-customers");
  const panelBookings = document.getElementById("panel-staff-bookings");
  const panelCustomers = document.getElementById("panel-staff-customers");

  if (tabBookings && tabCustomers && panelBookings && panelCustomers) {
    tabBookings.onclick = () => {
      tabBookings.classList.add("active");
      tabCustomers.classList.remove("active");
      panelBookings.classList.add("active");
      panelCustomers.classList.remove("active");
    };

    tabCustomers.onclick = () => {
      tabCustomers.classList.add("active");
      tabBookings.classList.remove("active");
      panelCustomers.classList.add("active");
      panelBookings.classList.remove("active");
    };
  }
}

function setupStaffListeners() {
  const statusFilter = document.getElementById("staff-booking-status-filter");
  const searchInput = document.getElementById("staff-customer-search-input");

  if (statusFilter) {
    statusFilter.addEventListener("change", applyStaffBookingsFilter);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyStaffCustomerSearch);
  }

  // Modal close btn
  const closeBtn = document.getElementById("history-modal-close-btn");
  const modal = document.getElementById("customer-history-modal-overlay");
  if (closeBtn && modal) {
    closeBtn.onclick = () => {
      modal.classList.remove("open");
    };
    // Close on overlay click
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove("open");
    };
  }
}

async function loadStaffBookings() {
  try {
    allBookings = await api.get("/api/bookings");
    applyStaffBookingsFilter();
  } catch (err) {
    console.error("Failed to load staff bookings:", err);
  }
}

function applyStaffBookingsFilter() {
  const tbody = document.getElementById("staff-bookings-tbody");
  const emptyState = document.getElementById("staff-bookings-empty");
  const tableWrapper = document.getElementById("staff-bookings-table-wrapper");
  const statusVal = document.getElementById("staff-booking-status-filter")?.value || "ALL";

  if (!tbody) return;

  let filtered = allBookings;
  if (statusVal !== "ALL") {
    filtered = allBookings.filter(b => b.status === statusVal);
  }

  if (filtered.length === 0) {
    if (tableWrapper) tableWrapper.style.display = "none";
    if (emptyState) emptyState.style.display = "flex";
    return;
  }

  if (tableWrapper) tableWrapper.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  tbody.innerHTML = filtered.map(b => {
    const pickupStr = new Date(b.pickup_date).toLocaleDateString();
    const returnStr = new Date(b.return_date).toLocaleDateString();
    const statusClass = b.status === "CONFIRMED" ? "badge-success" : 
                        b.status === "PENDING" ? "badge-warning" : 
                        b.status === "COMPLETED" ? "badge-info" : "badge-error";

    // Build action buttons depending on booking status
    let actionButtons = "";
    if (b.status === "PENDING") {
      actionButtons = `
        <button class="btn btn-accent btn-sm btn-update-status" data-id="${b.id}" data-status="CONFIRMED">Confirm</button>
        <button class="btn btn-secondary btn-sm btn-update-status" data-id="${b.id}" data-status="CANCELLED">Cancel</button>
      `;
    } else if (b.status === "CONFIRMED") {
      actionButtons = `
        <button class="btn btn-primary btn-sm btn-update-status" data-id="${b.id}" data-status="COMPLETED">Complete</button>
        <button class="btn btn-secondary btn-sm btn-update-status" data-id="${b.id}" data-status="CANCELLED">Cancel</button>
      `;
    } else {
      actionButtons = `<span style="font-size: var(--font-size-xs); color: var(--color-muted);">No action</span>`;
    }

    return `
      <tr>
        <td style="font-family: monospace; font-weight: bold;">${b.booking_reference}</td>
        <td>
          <div style="font-weight: 600;">${b.customer.first_name} ${b.customer.last_name}</div>
          <div style="font-size: 11px; color: var(--color-muted);">${b.customer.email}</div>
        </td>
        <td>${b.vehicle.name}</td>
        <td>${pickupStr} - ${returnStr} <span style="font-size: 11px; color: var(--color-muted);">(${b.total_days} days)</span></td>
        <td style="font-weight: 600;">$${parseFloat(b.total_amount).toFixed(2)}</td>
        <td><span class="badge ${statusClass}">${b.status}</span></td>
        <td style="text-align: right; display: flex; gap: var(--space-2); justify-content: flex-end;">${actionButtons}</td>
      </tr>
    `;
  }).join("");

  // Attach status change events
  tbody.querySelectorAll(".btn-update-status").forEach(btn => {
    btn.onclick = async (e) => {
      const id = e.target.getAttribute("data-id");
      const nextStatus = e.target.getAttribute("data-status");
      
      if (confirm(`Set booking status to ${nextStatus}?`)) {
        try {
          await api.put(`/api/bookings/${id}/status`, { status: nextStatus });
          alert(`Booking status changed to ${nextStatus}.`);
          await loadStaffBookings();
        } catch (err) {
          alert(err.message || "Failed to update booking status.");
        }
      }
    };
  });
}

async function loadStaffCustomers() {
  try {
    allCustomers = await api.get("/api/users/customers");
    applyStaffCustomerSearch();
  } catch (err) {
    console.error("Failed to load staff customers directory:", err);
  }
}

function applyStaffCustomerSearch() {
  const tbody = document.getElementById("staff-customers-tbody");
  const emptyState = document.getElementById("staff-customers-empty");
  const tableWrapper = document.getElementById("staff-customers-table-wrapper");
  const searchVal = (document.getElementById("staff-customer-search-input")?.value || "").toLowerCase().trim();

  if (!tbody) return;

  const filtered = allCustomers.filter(c => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    return fullName.includes(searchVal) || 
           c.email.toLowerCase().includes(searchVal) || 
           c.phone.toLowerCase().includes(searchVal);
  });

  if (filtered.length === 0) {
    if (tableWrapper) tableWrapper.style.display = "none";
    if (emptyState) emptyState.style.display = "flex";
    return;
  }

  if (tableWrapper) tableWrapper.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  tbody.innerHTML = filtered.map(c => {
    const totalSpend = c.bookings.reduce((sum, b) => {
      if (b.status === "COMPLETED" || b.status === "CONFIRMED") {
        return sum + parseFloat(b.total_amount);
      }
      return sum;
    }, 0);

    return `
      <tr>
        <td style="font-weight: 600;">${c.first_name} ${c.last_name}</td>
        <td>${c.email}</td>
        <td>${c.phone || "—"}</td>
        <td style="font-weight: 600;">${c.bookings.length} bookings</td>
        <td style="font-weight: 600; color: var(--color-success);">$${totalSpend.toFixed(2)}</td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm btn-view-history" data-id="${c.id}">View History</button>
        </td>
      </tr>
    `;
  }).join("");

  // Attach History click handler
  tbody.querySelectorAll(".btn-view-history").forEach(btn => {
    btn.onclick = (e) => {
      const id = e.target.getAttribute("data-id");
      const customer = allCustomers.find(c => c.id === id);
      if (customer) showCustomerHistoryModal(customer);
    };
  });
}

function showCustomerHistoryModal(c) {
  const modal = document.getElementById("customer-history-modal-overlay");
  const title = document.getElementById("history-modal-title");
  const nameLabel = document.getElementById("hist-cust-name");
  const spendLabel = document.getElementById("hist-cust-spend");
  const countLabel = document.getElementById("hist-cust-count");
  const tbody = document.getElementById("hist-cust-tbody");

  if (!modal) return;

  if (title) title.textContent = `${c.first_name}'s Rental Record`;
  if (nameLabel) nameLabel.textContent = `${c.first_name} ${c.last_name}`;
  
  const totalSpend = c.bookings.reduce((sum, b) => {
    if (b.status === "COMPLETED" || b.status === "CONFIRMED") {
      return sum + parseFloat(b.total_amount);
    }
    return sum;
  }, 0);
  
  if (spendLabel) spendLabel.textContent = `$${totalSpend.toFixed(2)}`;
  if (countLabel) countLabel.textContent = `${c.bookings.length} booking${c.bookings.length !== 1 ? 's' : ''}`;

  if (tbody) {
    if (c.bookings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--color-muted); padding: var(--space-6);">No bookings logged.</td>
        </tr>
      `;
    } else {
      tbody.innerHTML = c.bookings.map(b => {
        const pickupStr = new Date(b.pickup_date).toLocaleDateString();
        const returnStr = new Date(b.return_date).toLocaleDateString();
        const statusClass = b.status === "CONFIRMED" ? "badge-success" : 
                            b.status === "PENDING" ? "badge-warning" : 
                            b.status === "COMPLETED" ? "badge-info" : "badge-error";

        return `
          <tr>
            <td style="font-family: monospace; font-weight: bold;">${b.booking_reference}</td>
            <td>Vehicle ID: ${b.vehicle_id.substring(0,8)}...</td>
            <td>${pickupStr} - ${returnStr}</td>
            <td>$${parseFloat(b.total_amount).toFixed(2)}</td>
            <td><span class="badge ${statusClass}">${b.status}</span></td>
          </tr>
        `;
      }).join("");
    }
  }

  modal.classList.add("open");
}
