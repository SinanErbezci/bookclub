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

  // 🔥 handle pagination automatically
  return result.results || result;
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