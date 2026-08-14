import { apiFetch } from "./client";
import { ApiError, type PaginatedResponse } from "../types/api";
import type {
  CreateReviewData,
  Review,
  UpdateReviewData,
} from "../types/review";

export async function getReviewsByBook(
  bookId: number,
  url?: string,
): Promise<PaginatedResponse<Review>> {
  const endpoint = url ?? `/reviews/?book=${bookId}`;

  return apiFetch<PaginatedResponse<Review>>(endpoint);
}

export async function createReview(
  data: CreateReviewData,
): Promise<Review> {
  return apiFetch<Review>("/reviews/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateReview(
  id: number,
  data: UpdateReviewData,
): Promise<Review> {
  return apiFetch<Review>(`/reviews/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getUserReview(
  bookId: number,
): Promise<Review | null> {
  try {
    return await apiFetch<Review>(
      `/reviews/user/?book=${bookId}`,
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 ||
        error.status === 403 ||
        error.status === 404)
    ) {
      return null;
    }

    throw error;
  }
}

export async function deleteReview(
  reviewId: number,
): Promise<boolean> {
  await apiFetch<void>(`/reviews/${reviewId}/`, {
    method: "DELETE",
  });

  return true;
}