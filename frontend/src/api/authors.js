import { apiFetch } from "./client";

// 🎲 RANDOM AUTHOR
export async function getRandomAuthor() {
  return await apiFetch("/random/author/");
}

// 👤 AUTHOR BY ID
export async function getAuthorById(id) {
  return await apiFetch(`/authors/${id}`);
}