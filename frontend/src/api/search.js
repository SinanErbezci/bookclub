import { apiFetch } from "./client";

export async function searchBooks(query) {
  return apiFetch(
    `/search/?q=${encodeURIComponent(query)}`
  );
}