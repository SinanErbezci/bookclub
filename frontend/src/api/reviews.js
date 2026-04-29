import { csrfFetch } from "./client";

const BASE_URL = process.env.REACT_APP_API_URL;

export async function getReviewsByBook(bookId, url = null) {
    const endpoint =
    url || `${BASE_URL}/reviews/?book=${bookId}`;

  const res = await fetch(endpoint, {
    credentials: "include",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Failed to fetch reviews");
  }

  return result;
}

export async function createReview(data) {
  const res = await csrfFetch("/reviews/", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Failed to create review");
  }

  return result;
}

export async function updateReview(id, data) {
  const res = await csrfFetch(`/reviews/${id}/`, {
    method: "PATCH",
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

  if (res.status === 401 || res.status === 403) {
    return null;
  }
  if (res.status === 404) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch user review");
  }

  return data;
}

export async function deleteReview(reviewId) {
  const res = await csrfFetch(`/reviews/${reviewId}/`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete review");
  }
}