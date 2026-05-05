import { apiFetch } from "./client";

// 📚 RECENT BOOKS
export async function getRecentBooks() {
  return await apiFetch("/books/?ordering=-id&page_size=12");
}

// 📖 BOOK BY ID
export async function getBookById(id) {
  return await apiFetch(`/books/${id}/`);
}

// 📚 BOOKS BY GENRE (simple use)
export async function getBooksByGenre(genreId) {
  const data = await apiFetch(
    `/books/?genres__id=${genreId}&page_size=12`
  );

  return data.results;
}

// 📚 PAGINATED GENRE BOOKS
export async function getBooksByGenrePaginated(
  genreId,
  page = 1
) {
  return await apiFetch(
    `/books/?genres__id=${genreId}&page=${page}`
  );
}