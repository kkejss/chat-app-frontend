const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Funksion baze per te gjitha kerkesa HTTP drejt backend-it
// Shton automatikisht token-in JWT dhe Content-Type ne headers
export async function apiFetch(endpoint, options = {}) {
  const { headers: optionHeaders, ...restOptions } = options;

  // Merr token-in nga localStorage nese ekziston
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      // Shton Authorization header vetem nese ka token
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...optionHeaders,
    },
    ...restOptions,
  });

  const data = await response.json();

  // Hedh gabim nese serveri ktheu status jo-OK (4xx, 5xx)
  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}