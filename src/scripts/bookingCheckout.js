// src/scripts/bookingCheckout.js
import { api, getUserInfo } from "./api.js";

let checkoutVehicle = null;
let bookingPickupDate = null;
let bookingReturnDate = null;

export async function renderBookingCheckout(params) {
  const vehicleId = params.get("vehicleId");
  const pickup = params.get("pickup");
  const returnD = params.get("return");

  if (!vehicleId) {
    location.hash = "#vehicles";
    return;
  }

  // Pre-fill parameters if present
  bookingPickupDate = pickup || new Date().toISOString().split("T")[0];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 3);
  bookingReturnDate = returnD || nextDate.toISOString().split("T")[0];

  try {
    checkoutVehicle = await api.get(`/api/vehicles/${vehicleId}`);
    initializeForm(checkoutVehicle);
  } catch (err) {
    console.error("Failed to load checkout vehicle details:", err);
  }
}

function initializeForm(v) {
  const user = getUserInfo();

  // Populate Order Summary
  const vehicleImage = document.querySelector("#order-summary img");
  const vehicleTitle = document.querySelector("#order-summary h4");
  const vehicleSpecs = document.querySelector("#order-summary p");
  
  if (vehicleImage) vehicleImage.src = v.thumbnail_url || "/vehicle_placeholder.png";
  if (vehicleTitle) vehicleTitle.textContent = `${v.year || '2024'} ${v.name}`;
  if (vehicleSpecs) vehicleSpecs.textContent = `${v.category} • ${v.transmission} • ${v.seat_count} Seats`;

  // Pre-populate input elements
  const inputPickup = document.querySelector('#step-1 input[type="date"]:nth-of-type(1)');
  const inputDropoff = document.querySelectorAll('#step-1 input[type="date"]')[1] || document.querySelector('#step-1 input[type="date"]:nth-of-type(2)');

  // Let's hook up dynamic calculation
  const dateInputs = document.querySelectorAll('#step-1 input[type="date"]');
  if (dateInputs[0]) dateInputs[0].value = bookingPickupDate;
  if (dateInputs[1]) dateInputs[1].value = bookingReturnDate;

  // Fill in User Profile details in Step 2 if user is logged in
  if (user) {
    const step2Inputs = document.querySelectorAll('#step-2 input');
    if (step2Inputs[0]) step2Inputs[0].value = user.first_name || "";
    if (step2Inputs[1]) step2Inputs[1].value = user.last_name || "";
    if (step2Inputs[2]) step2Inputs[2].value = user.email || "";
    if (step2Inputs[3]) step2Inputs[3].value = user.phone || "";
  }

  // Bind Calculation and hooks
  const updateSummaryCost = () => {
    const startVal = dateInputs[0]?.value;
    const endVal = dateInputs[1]?.value;
    if (!startVal || !endVal) return;

    const start = new Date(startVal);
    const end = new Date(endVal);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    const dailyRate = v.daily_rate;
    const rentCost = dailyRate * days;
    const insuranceCost = 20.00 * days; // Mock Premium Insurance rate
    const taxesAndFees = 50.00;
    const totalCost = rentCost + insuranceCost + taxesAndFees;

    // Update Breakdown Cost Summary Sidebar Panel
    const breakdownEl = document.querySelector("#order-summary .space-y-sm");
    if (breakdownEl) {
      breakdownEl.innerHTML = `
        <div class="flex justify-between">
          <span class="font-body-sm text-body-sm text-on-surface-variant">$${dailyRate.toFixed(2)} x ${days} days</span>
          <span class="font-body-sm text-body-sm text-on-surface">$${rentCost.toFixed(2)}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-body-sm text-body-sm text-on-surface-variant">Premium Insurance</span>
          <span class="font-body-sm text-body-sm text-on-surface">$${insuranceCost.toFixed(2)}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-body-sm text-body-sm text-on-surface-variant">Taxes &amp; Fees</span>
          <span class="font-body-sm text-body-sm text-on-surface">$${taxesAndFees.toFixed(2)}</span>
        </div>
      `;
    }

    const totalCostLabel = document.querySelector("#order-summary .font-headline-md");
    if (totalCostLabel) {
      totalCostLabel.textContent = `$${totalCost.toFixed(2)}`;
    }

    // Update Pay Button label in Step 3
    const payBtn = document.querySelector("#step-3 button:last-of-type");
    if (payBtn) {
      payBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]" data-icon="lock" style="font-variation-settings: 'FILL' 1;">lock</span> Pay $${totalCost.toFixed(2)}`;
    }
  };

  // Attach change event listeners to recalculate price live
  dateInputs.forEach(input => input.addEventListener("change", updateSummaryCost));
  updateSummaryCost();

  // Bind form buttons
  window.nextStep = (stepNumber) => {
    // Basic validation
    if (stepNumber === 2) {
      const pickupVal = dateInputs[0]?.value;
      const dropoffVal = dateInputs[1]?.value;
      if (!pickupVal || !dropoffVal || new Date(dropoffVal) <= new Date(pickupVal)) {
        alert("Please enter valid pickup and dropoff dates.");
        return;
      }
    }
    showStep(stepNumber);
  };

  window.prevStep = (stepNumber) => {
    showStep(stepNumber);
  };

  window.completeBooking = async () => {
    try {
      const result = await api.post("/api/bookings", {
        vehicle_id: v.id,
        pickup_date: dateInputs[0]?.value,
        return_date: dateInputs[1]?.value
      });

      // Show Step 4 and populate confirmation box details
      document.getElementById('order-summary').style.display = 'none';
      const formContainer = document.getElementById('form-container');
      formContainer.classList.remove('lg:col-span-8');
      formContainer.classList.add('lg:col-span-12', 'max-w-2xl', 'mx-auto');

      // Populate confirmation box details
      const confTitle = document.querySelector("#step-4 p");
      if (confTitle) confTitle.textContent = `Your reservation for the ${v.name} is complete.`;

      const confDetails = document.querySelector("#step-4 .bg-surface-container-low");
      if (confDetails) {
        confDetails.innerHTML = `
          <div class="flex justify-between mb-sm border-b border-outline-variant pb-sm">
            <span class="font-label-sm text-label-sm text-on-surface-variant">Booking ID</span>
            <span class="font-label-md text-label-md text-on-surface">${result.booking_reference || 'FF-' + Math.random().toString(36).substring(3, 9).toUpperCase()}</span>
          </div>
          <div class="flex justify-between mb-sm border-b border-outline-variant pb-sm">
            <span class="font-label-sm text-label-sm text-on-surface-variant">Pick-up</span>
            <span class="font-label-md text-label-md text-on-surface text-right">${dateInputs[0]?.value}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-label-sm text-label-sm text-on-surface-variant">Total Paid</span>
            <span class="font-label-md text-label-md text-on-surface font-bold">${document.querySelector("#order-summary .font-headline-md")?.textContent || ''}</span>
          </div>
        `;
      }

      showStep(4);
    } catch (err) {
      alert("Error completing your booking: " + err.message);
    }
  };

  // Wire back button from confirmation step
  const dashboardRedirectBtn = document.querySelector("#step-4 button:last-of-type");
  if (dashboardRedirectBtn) {
    dashboardRedirectBtn.onclick = () => {
      location.hash = "#dashboard";
    };
  }
}
