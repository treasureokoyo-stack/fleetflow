// src/scripts/auth.js
import { api, setAuthToken, setUserInfo, getUserInfo } from "./api.js";

// Updates navigation header elements dynamically based on login status and role
export function setupAuthHeader() {
  const user = getUserInfo();
  
  const authButtons = document.getElementById("auth-buttons");
  const userProfile = document.getElementById("user-profile");
  const userDisplayName = document.getElementById("user-display-name");
  
  const navDashboard = document.getElementById("nav-dashboard");
  const navStaff = document.getElementById("nav-staff");
  const navAdmin = document.getElementById("nav-admin");
  
  // Hide all dynamic links initially
  if (navDashboard) navDashboard.style.display = "none";
  if (navStaff) navStaff.style.display = "none";
  if (navAdmin) navAdmin.style.display = "none";

  if (user) {
    if (authButtons) authButtons.style.display = "none";
    if (userProfile) userProfile.style.display = "flex";
    if (userDisplayName) userDisplayName.textContent = `${user.first_name} ${user.last_name}`;
    
    // Show role-specific routes
    if (user.role === "CUSTOMER") {
      if (navDashboard) navDashboard.style.display = "block";
    } else if (user.role === "STAFF") {
      if (navStaff) navStaff.style.display = "block";
    } else if (user.role === "ADMIN") {
      if (navAdmin) navAdmin.style.display = "block";
      if (navStaff) navStaff.style.display = "block"; // Admins can also see staff route
    }

    // Attach logout button
    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        setAuthToken(null);
        setUserInfo(null);
        location.hash = "";
        setupAuthHeader();
      };
    }
  } else {
    if (authButtons) authButtons.style.display = "block";
    if (userProfile) userProfile.style.display = "none";
  }
}

// Checks if current user is authorized for a specific role/route
export async function checkAuthRoute(requiredRole) {
  const user = getUserInfo();
  if (!user) return false;

  // Admin has access to everything
  if (user.role === "ADMIN") return true;

  if (requiredRole === "ADMIN" && user.role !== "ADMIN") return false;
  if (requiredRole === "STAFF" && user.role !== "STAFF" && user.role !== "ADMIN") return false;
  if (requiredRole === "CUSTOMER" && user.role !== "CUSTOMER") return false;

  return true;
}

export function renderLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const errorAlert = document.getElementById("login-general-error");
    
    if (errorAlert) errorAlert.style.display = "none";

    try {
      const data = await api.post("/api/auth/login", { email, password });
      setAuthToken(data.token);
      setUserInfo(data.user);
      
      // Update header
      setupAuthHeader();

      // Redirect depending on role
      if (data.user.role === "ADMIN") {
        location.hash = "#admin";
      } else if (data.user.role === "STAFF") {
        location.hash = "#staff";
      } else {
        location.hash = "#dashboard";
      }
    } catch (err) {
      if (errorAlert) {
        errorAlert.textContent = err.message || "Invalid email or password.";
        errorAlert.style.display = "block";
      }
    }
  });
}

export function renderRegister() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = document.getElementById("register-first-name").value.trim();
    const lastName = document.getElementById("register-last-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const phone = document.getElementById("register-phone").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const errorAlert = document.getElementById("register-general-error");

    if (errorAlert) errorAlert.style.display = "none";

    try {
      const data = await api.post("/api/auth/register", {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password
      });

      setAuthToken(data.token);
      setUserInfo(data.user);

      // Update header
      setupAuthHeader();

      // Redirect to customer dashboard
      location.hash = "#dashboard";
    } catch (err) {
      if (errorAlert) {
        errorAlert.textContent = err.message || "Registration failed. Try again.";
        errorAlert.style.display = "block";
      }
    }
  });
}
