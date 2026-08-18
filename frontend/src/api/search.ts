import { apiFetch } from "./client";
import type {
  SearchResponse,
  SemanticSearchBook,
} from "../types/search";

export async function searchAll(
  query: string,
  page = 1,
  mode = "full",
): Promise<SearchResponse> {
  return apiFetch<SearchResponse>(
    `/search/?q=${encodeURIComponent(query)}&page=${page}&mode=${mode}`,
  );
}

export async function semanticSearch(
  query: string,
  limit = 10,
): Promise<SemanticSearchBook[]> {
  return apiFetch<SemanticSearchBook[]>(
    `/search/semantic/?q=${encodeURIComponent(query)}&limit=${limit}`,
  );
}