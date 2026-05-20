import { apiFetch } from "./client";

export async function searchAll(query) {
  return apiFetch(
    `/search/?q=${encodeURIComponent(query)}`
  );
}