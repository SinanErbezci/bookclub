import { apiFetch } from "./client";
import type { Genre, RandomGenre } from "../types/genre";

export async function getRandomGenre(): Promise<RandomGenre> {
  return apiFetch<RandomGenre>("/random/genre/");
}

export async function getGenreById(
  id: number,
): Promise<Genre> {
  return apiFetch<Genre>(
    `/genres/${id}/`,
  );
}