import { getCookie } from "../utils/cookies";

const BASE_URL = process.env.REACT_APP_API_URL;

export async function csrfFetch(path, options = {}) {
  // Ensure CSRF cookie exists
  await fetch(`${BASE_URL}/csrf/`, {
    credentials: "include",
  });

  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
      ...(options.headers || {}),
    },
    ...options,
  });

  return res;
}