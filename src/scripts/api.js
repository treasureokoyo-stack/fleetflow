// src/scripts/api.js
const BASE_URL = "";

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

export function getUserInfo() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function setUserInfo(user) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  get: (endpoint, headers) => request(endpoint, { method: "GET", headers }),
  post: (endpoint, body, headers) => request(endpoint, { method: "POST", body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers) => request(endpoint, { method: "PUT", body: JSON.stringify(body), headers }),
  delete: (endpoint, headers) => request(endpoint, { method: "DELETE", headers })
};
