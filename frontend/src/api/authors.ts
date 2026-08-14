import { apiFetch } from "./client";
import type { Author } from "../types/author";

export async function getRandomAuthor(): Promise<Author> {
  return apiFetch<Author>("/random/author/");
}

export async function getAuthorById(
  id: number,
): Promise<Author> {
  return apiFetch<Author>(`/authors/${id}`);
}