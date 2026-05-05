import { apiFetch } from "./client";

// 🎲 RANDOM GENRE
export async function getRandomGenre() {
  return await apiFetch("/random/genre/");
}

// 📚 GENRE BY ID
export async function getGenreById(id) {
  return await apiFetch(`/genres/${id}/`);
}