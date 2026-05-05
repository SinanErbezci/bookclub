import { apiFetch } from "./client";

const BASE_URL = process.env.REACT_APP_API_URL;

// 📚 GET REVIEWS (supports pagination URL)
export async function getReviewsByBook(bookId, url = null) {
  if (url) {
    // 🔁 pagination links may be absolute → use plain fetch
    const res = await fetch(url, { credentials: "include" });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const message =
        data?.message || data?.detail || "Failed to fetch reviews";
      throw new Error(message);
    }

    return data;
  }

  // default endpoint uses apiFetch
  return await apiFetch(`/reviews/?book=${bookId}`);
}

// ➕ CREATE REVIEW
export async function createReview(data) {
  return await apiFetch("/reviews/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ✏️ UPDATE REVIEW
export async function updateReview(id, data) {
  return await apiFetch(`/reviews/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// 👤 GET CURRENT USER'S REVIEW (graceful nulls)
export async function getUserReview(bookId) {
  try {
    return await apiFetch(`/reviews/user/?book=${bookId}`);
  } catch (err) {
    // 🔥 expected cases: not logged in or no review
    if (err.status === 401 || err.status === 403 || err.status === 404) {
      return null;
    }
    throw err;
  }
}

// ❌ DELETE REVIEW
export async function deleteReview(reviewId) {
  await apiFetch(`/reviews/${reviewId}/`, {
    method: "DELETE",
  });

  return true;
}