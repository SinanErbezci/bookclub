import { apiFetch } from "./client";

export async function searchAll(query, page = 1) {
  return apiFetch(
    `/search/?q=${encodeURIComponent(query)}&${page}`
  );
}