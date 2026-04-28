import { getCookie } from "../utils/cookies";

const BASE_URL = process.env.REACT_APP_API_URL;

export async function getReviewsByBook(bookId) {
  const res = await fetch(`${BASE_URL}/reviews/?book=${bookId}`, {
    credentials: "include",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Failed to fetch reviews");
  }

  return Array.isArray(result) ? result : result.results ?? [];
}

export async function createReview(data) {
  // 🔥 ensure CSRF cookie exists
  await fetch(`${BASE_URL}/csrf/`, {
    credentials: "include",
  });

  const res = await fetch(`${BASE_URL}/reviews/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Failed to create review");
  }

  return result;
}

export async function updateReview(id, data) {
  await fetch(`${BASE_URL}/csrf/`, { credentials: "include" });

  const res = await fetch(`${BASE_URL}/reviews/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Failed to update review");
  }

  return result;
}


export async function getUserReview(bookId) {
  const res = await fetch(`${BASE_URL}/reviews/user/?book=${bookId}`, {
    credentials: "include",
  });

  if (res.status === 404) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch user review");
  }

  return data;
}