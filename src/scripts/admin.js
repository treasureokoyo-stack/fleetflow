// src/scripts/admin.js
import { api } from "./api.js";

let allVehicles = [];
let allBookings = [];
let allStaff = [];

export async function renderAdmin() {
  setupAdminTabs();
  setupAdminListeners();

  // Load Admin Data
  await loadAdminReports();
  await loadAdminVehicles();
  await loadAdminBookings();
  await loadAdminStaff();
}

function setupAdminTabs() {
  const tabs = [
    { btn: "admin-tab-reports", panel: "panel-admin-reports" },
    { btn: "admin-tab-vehicles", panel: "panel-admin-vehicles" },
    { btn: "admin-tab-bookings", panel: "panel-admin-bookings" },
    { btn: "admin-tab-staff", panel: "panel-admin-staff" }
  ];

  tabs.forEach(t => {
    const btnEl = document.getElementById(t.btn);
    const panelEl = document.getElementById(t.panel);

    if (btnEl && panelEl) {
      btnEl.onclick = () => {
        // Remove active class from all
        tabs.forEach(x => {
          document.getElementById(x.btn)?.classList.remove("active");
          document.getElementById(x.panel)?.classList.remove("active");
        });
        // Add active to current
        btnEl.classList.add("active");
        panelEl.classList.add("active");
      };
    }
  });
}

function setupAdminListeners() {
  // Vehicle CRUD Modal bindings
  const addVehicleBtn = document.getElementById("btn-add-vehicle");
  const vehicleModal = document.getElementById("vehicle-form-modal-overlay");
  const closeVehicleBtn = document.getElementById("vehicle-modal-close-btn");
  const vehicleForm = document.getElementById("vehicle-form");

  if (addVehicleBtn && vehicleModal) {
    addVehicleBtn.onclick = () => {
      document.getElementById("vehicle-modal-title").textContent = "Create New Vehicle";
      document.getElementById("vehicle-form-id").value = "";
      vehicleForm.reset();
      vehicleModal.classList.add("open");
    };
  }

  if (closeVehicleBtn && vehicleModal) {
    closeVehicleBtn.onclick = () => {
      vehicleModal.classList.remove("open");
    };
  }

  if (vehicleForm) {
    vehicleForm.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById("vehicle-form-id").value;
      const errorMsg = document.getElementById("vehicle-form-error");
      if (errorMsg) errorMsg.style.display = "none";

      const payload = {
        name: document.getElementById("v-name").value.trim(),
        brand: document.getElementById("v-brand").value.trim(),
        model: document.getElementById("v-model").value.trim(),
        year: parseInt(document.getElementById("v-year").value),
        category: document.getElementById("v-category").value,
        transmission: document.getElementById("v-transmission").value,
        seat_count: parseInt(document.getElementById("v-seats").value),
        daily_rate: parseFloat(document.getElementById("v-rate").value),
        mileage: parseInt(document.getElementById("v-mileage").value || 0),
        description: document.getElementById("v-description").value.trim(),
        thumbnail_url: document.getElementById("v-image").value.trim(),
        status: document.getElementById("v-status").value
      };

      // Validations
      if (payload.daily_rate <= 0) {
        if (errorMsg) {
          errorMsg.textContent = "Daily rate must be greater than zero.";
          errorMsg.style.display = "block";
        }
        return;
      }

      try {
        if (id) {
          // Edit mode
          await api.put(`/api/vehicles/${id}`, payload);
          alert("Vehicle updated successfully.");
        } else {
          // Create mode
          await api.post("/api/vehicles", payload);
          alert("Vehicle created successfully.");
        }
        vehicleModal.classList.remove("open");
        await loadAdminVehicles(); // reload
        await loadAdminReports(); // reload stats
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = err.message || "Failed to save vehicle details.";
          errorMsg.style.display = "block";
        }
      }
    };
  }

  // Staff registration modal bindings
  const addStaffBtn = document.getElementById("btn-add-staff");
  const staffModal = document.getElementById("staff-form-modal-overlay");
  const closeStaffBtn = document.getElementById("staff-modal-close-btn");
  const staffForm = document.getElementById("staff-form");

  if (addStaffBtn && staffModal) {
    addStaffBtn.onclick = () => {
      staffForm.reset();
      staffModal.classList.add("open");
    };
  }

  if (closeStaffBtn && staffModal) {
    closeStaffBtn.onclick = () => {
      staffModal.classList.remove("open");
    };
  }

  if (staffForm) {
    staffForm.onsubmit = async (e) => {
      e.preventDefault();
      const errorMsg = document.getElementById("staff-form-error");
      if (errorMsg) errorMsg.style.display = "none";

      const payload = {
        first_name: document.getElementById("st-first-name").value.trim(),
        last_name: document.getElementById("st-last-name").value.trim(),
        email: document.getElementById("st-email").value.trim(),
        phone: document.getElementById("st-phone").value.trim(),
        password: document.getElementById("st-password").value.trim(),
        role: document.getElementById("st-role").value
      };

      try {
        await api.post("/api/admin/staff", payload);
        alert("Staff member registered successfully.");
        staffModal.classList.remove("open");
        await loadAdminStaff(); // reload list
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = err.message || "Failed to register staff member.";
          errorMsg.style.display = "block";
        }
      }
    };
  }
}

async function loadAdminReports() {
  try {
    const metrics = await api.get("/api/admin/metrics");
    
    document.getElementById("rep-revenue").textContent = `$${parseFloat(metrics.totalRevenue || 0).toFixed(2)}`;
    document.getElementById("rep-bookings").textContent = metrics.totalBookings || 0;
    document.getElementById("rep-customers").textContent = metrics.totalCustomers || 0;
    document.getElementById("rep-vehicles").textContent = metrics.totalVehicles || 0;

    // Draw Status Bar Chart
    const statusChart = document.getElementById("chart-vehicle-status");
    if (statusChart && metrics.vehiclesByStatus) {
      const stats = metrics.vehiclesByStatus;
      const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1;
      
      statusChart.innerHTML = Object.entries(stats).map(([status, count]) => {
        const pct = (count / total) * 100;
        return `
          <div class="flex flex-col items-center" style="width: 60px;">
            <span style="font-size: 11px; font-weight: bold; margin-bottom: 4px;">${count}</span>
            <div style="width: 32px; height: ${Math.max(pct, 5)}%; min-height: 8px; background-color: var(--color-accent); border-radius: var(--radius-sm) var(--radius-sm) 0 0;" class="chart-bar"></div>
            <span style="font-size: 9px; color: var(--color-muted); text-transform: uppercase; margin-top: 6px; text-align: center;">${status}</span>
          </div>
        `;
      }).join("");
    }

    // Draw Bookings Monthly Chart
    const monthlyChart = document.getElementById("chart-monthly-bookings");
    if (monthlyChart && metrics.bookingsByMonth) {
      const data = metrics.bookingsByMonth;
      const maxVal = Math.max(...Object.values(data)) || 1;

      monthlyChart.innerHTML = Object.entries(data).map(([month, count]) => {
        const pct = (count / maxVal) * 100;
        return `
          <div class="flex flex-col items-center" style="width: 60px;">
            <span style="font-size: 11px; font-weight: bold; margin-bottom: 4px;">${count}</span>
            <div style="width: 32px; height: ${Math.max(pct, 5)}%; min-height: 8px; background-color: var(--color-primary); border-radius: var(--radius-sm) var(--radius-sm) 0 0;" class="chart-bar"></div>
            <span style="font-size: 9px; color: var(--color-muted); text-transform: uppercase; margin-top: 6px;">${month}</span>
          </div>
        `;
      }).join("");
    }

  } catch (err) {
    console.error("Failed to load reports metrics:", err);
  }
}

async function loadAdminVehicles() {
  const tbody = document.getElementById("admin-vehicles-tbody");
  const emptyState = document.getElementById("admin-vehicles-empty");
  const tableWrapper = document.getElementById("admin-vehicles-table-wrapper");

  if (!tbody) return;

  try {
    allVehicles = await api.get("/api/vehicles");

    if (allVehicles.length === 0) {
      if (tableWrapper) tableWrapper.style.display = "none";
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    if (tableWrapper) tableWrapper.style.display = "block";
    if (emptyState) emptyState.style.display = "none";

    tbody.innerHTML = allVehicles.map(v => {
      const statusClass = v.status === "AVAILABLE" ? "badge-success" : 
                          v.status === "BOOKED" ? "badge-warning" : 
                          v.status === "MAINTENANCE" ? "badge-info" : "badge-muted";

      return `
        <tr>
          <td><img src="${v.thumbnail_url || '/vehicle_placeholder.png'}" alt="Vehicle" style="width: 64px; height: 40px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--color-border);" onerror="this.src='/vehicle_placeholder.png';" /></td>
          <td style="font-weight: 600;">${v.name}</td>
          <td>${v.category}</td>
          <td style="font-weight: 600;">$${v.daily_rate}/day</td>
          <td><span class="badge ${statusClass}">${v.status}</span></td>
          <td>${v.mileage ? v.mileage.toLocaleString() + ' miles' : '—'}</td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm btn-edit-vehicle" data-id="${v.id}">Edit</button>
            <button class="btn btn-danger btn-sm btn-delete-vehicle" data-id="${v.id}">Delete</button>
          </td>
        </tr>
      `;
    }).join("");

    // Bind edit buttons
    tbody.querySelectorAll(".btn-edit-vehicle").forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.getAttribute("data-id");
        const vehicle = allVehicles.find(x => x.id === id);
        if (vehicle) {
          document.getElementById("vehicle-modal-title").textContent = "Edit Vehicle Details";
          document.getElementById("vehicle-form-id").value = vehicle.id;
          
          document.getElementById("v-name").value = vehicle.name;
          document.getElementById("v-brand").value = vehicle.brand;
          document.getElementById("v-model").value = vehicle.model;
          document.getElementById("v-year").value = vehicle.year;
          document.getElementById("v-category").value = vehicle.category;
          document.getElementById("v-transmission").value = vehicle.transmission;
          document.getElementById("v-seats").value = vehicle.seat_count;
          document.getElementById("v-rate").value = vehicle.daily_rate;
          document.getElementById("v-mileage").value = vehicle.mileage || "";
          document.getElementById("v-description").value = vehicle.description;
          document.getElementById("v-image").value = vehicle.thumbnail_url || "";
          document.getElementById("v-status").value = vehicle.status;

          document.getElementById("vehicle-form-modal-overlay").classList.add("open");
        }
      };
    });

    // Bind delete buttons
    tbody.querySelectorAll(".btn-delete-vehicle").forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.getAttribute("data-id");
        if (confirm("Delete this vehicle? This action will fail if active bookings depend on it.")) {
          try {
            await api.delete(`/api/vehicles/${id}`);
            alert("Vehicle deleted successfully.");
            await loadAdminVehicles();
            await loadAdminReports();
          } catch (err) {
            alert(err.message || "Failed to delete vehicle record.");
          }
        }
      };
    });

  } catch (err) {
    console.error("Failed to load admin vehicles CRUD:", err);
  }
}

async function loadAdminBookings() {
  const tbody = document.getElementById("admin-bookings-tbody");
  if (!tbody) return;

  try {
    allBookings = await api.get("/api/bookings");
    
    tbody.innerHTML = allBookings.map(b => {
      const pickupStr = new Date(b.pickup_date).toLocaleDateString();
      const returnStr = new Date(b.return_date).toLocaleDateString();
      const statusClass = b.status === "CONFIRMED" ? "badge-success" : 
                          b.status === "PENDING" ? "badge-warning" : 
                          b.status === "COMPLETED" ? "badge-info" : "badge-error";

      let actions = "";
      if (b.status !== "CANCELLED" && b.status !== "COMPLETED") {
        actions = `<button class="btn btn-secondary btn-sm btn-admin-cancel" data-id="${b.id}">Cancel</button>`;
      } else {
        actions = `<span style="font-size: 11px; color: var(--color-muted);">Finalised</span>`;
      }

      return `
        <tr>
          <td style="font-family: monospace; font-weight: bold;">${b.booking_reference}</td>
          <td>${b.customer.first_name} ${b.customer.last_name}</td>
          <td>${b.vehicle.name}</td>
          <td>${pickupStr} - ${returnStr}</td>
          <td style="font-weight: 600;">$${parseFloat(b.total_amount).toFixed(2)}</td>
          <td><span class="badge ${statusClass}">${b.status}</span></td>
          <td style="text-align: right;">${actions}</td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll(".btn-admin-cancel").forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.getAttribute("data-id");
        if (confirm("Admin Override: Cancel this booking?")) {
          try {
            await api.put(`/api/bookings/${id}/status`, { status: "CANCELLED" });
            alert("Booking marked as CANCELLED.");
            await loadAdminBookings();
            await loadAdminReports();
          } catch (err) {
            alert(err.message || "Failed to override booking.");
          }
        }
      };
    });

  } catch (err) {
    console.error("Failed to load admin bookings:", err);
  }
}

async function loadAdminStaff() {
  const tbody = document.getElementById("admin-staff-tbody");
  if (!tbody) return;

  try {
    allStaff = await api.get("/api/admin/staff");

    tbody.innerHTML = allStaff.map(s => {
      return `
        <tr>
          <td style="font-weight: 600;">${s.first_name} ${s.last_name}</td>
          <td>${s.email}</td>
          <td>${s.phone || "—"}</td>
          <td><span class="badge badge-info">${s.role}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-danger btn-sm btn-delete-staff" data-id="${s.id}">Delete</button>
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll(".btn-delete-staff").forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.getAttribute("data-id");
        if (confirm("Permanently delete this staff member?")) {
          try {
            await api.delete(`/api/admin/staff/${id}`);
            alert("Staff user deleted successfully.");
            await loadAdminStaff();
          } catch (err) {
            alert(err.message || "Failed to remove staff record.");
          }
        }
      };
    });

  } catch (err) {
    console.error("Failed to load admin staff list:", err);
  }
}
