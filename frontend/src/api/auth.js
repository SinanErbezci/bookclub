import { apiFetch } from "./client";

// 🔐 LOGIN
export async function loginUser(data) {
  // sets session cookie
  await apiFetch("/login/", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // 🔥 always return normalized user
  return getCurrentUser();
}

// 🔐 SIGNUP
export async function signupUser(data) {
  await apiFetch("/signup/", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // 🔥 same pattern as login
  return getCurrentUser();
}

// 🔐 CURRENT USER
export async function getCurrentUser() {
  const data = await apiFetch("/me/");

  // 🔥 normalize response
  return data?.user ?? data ?? null;
}

// 🔐 LOGOUT
export async function logoutUser() {
  await apiFetch("/logout/", {
    method: "POST",
  });
}