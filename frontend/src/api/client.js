const BASE_URL = process.env.REACT_APP_API_URL;

// 🔥 Core request function
export async function apiFetch(path, options = {}) {
  // Fetch CSRF token from backend
  const csrfRes = await fetch(`${BASE_URL}/csrf/`, {
    credentials: "include",
  });

  const csrfData = await csrfRes.json();

  const csrfToken = csrfData.csrfToken;

  // Main API request
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
      ...(options.headers || {}),
    },
    ...options,
  });

  let data;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // 🔥 Centralized error handling
  if (!res.ok) {
    const message =
      data?.message ||
      data?.detail ||
      "Something went wrong";

    const error = new Error(message);
    error.status = res.status;
    error.data = data;

    throw error;
  }

  return data;
}