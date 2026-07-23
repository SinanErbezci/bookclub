import { apiFetch } from "./client";

export async function searchAll(query, page = 1, mode = "full") {
  return apiFetch(
    `/search/?q=${encodeURIComponent(query)}&page=${page}&mode=${mode}`
  );
}

export async function semanticSearch(
  query,
  limit = 10,
) {
  return apiFetch(
    `/search/semantic/?q=${encodeURIComponent(
      query
    )}&limit=${limit}`
  );
}