import { apiFetch } from "./client";
import type {
  Book,
  BookListItem,
} from "../types/book";

interface RecommendationExplanation {
  summary: string;
}

export async function getRecentBooks(): Promise<BookListItem[]> {
  const data = await apiFetch("/books/?ordering=-id&page_size=12");
  return data.results;
}

export async function getBookById(id: number | string): Promise<Book> {
  return await apiFetch(`/books/${id}/`);
}

export async function getBooksByGenre(
  genreId: number,
): Promise<BookListItem[]> {
  const data = await apiFetch(
    `/books/?genres__id=${genreId}&page_size=12`,
  );

  return data.results;
}

export async function getSeriesById(id: number | string) {
  return apiFetch(`/series/${id}/`);
}

export async function getBooksByGenrePaginated(
  genreId: number,
  page = 1,
) {
  return await apiFetch(
    `/books/?genres__id=${genreId}&page=${page}`,
  );
}

export async function getBookRecommendations(
  bookId: number,
  limit = 8,
): Promise<BookListItem[]> {
  return apiFetch(
    `/books/${bookId}/recommendations/?limit=${limit}`,
  );
}

export async function getRecommendationExplanation(
  sourceId: number,
  recommendedId: number,
): Promise<RecommendationExplanation> {
  const data = await apiFetch(
    `/books/${sourceId}/recommendations/${recommendedId}/explanation/`,
  );

  return data.explanation;
}