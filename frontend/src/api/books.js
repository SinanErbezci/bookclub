const BASE_URL = process.env.REACT_APP_API_URL;

// 🔥 helper (optional but clean)
async function handleResponse(res) {
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// ===== GET RECENT BOOKS =====
export async function getRecentBooks() {
  const res = await fetch(
    `${BASE_URL}/books/?ordering=-id&page_size=12`
  );

  // optional delay for testing
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return handleResponse(res);
}

// ===== GET BOOK BY ID =====
export async function getBookById(id) {
  const res = await fetch(`${BASE_URL}/books/${id}/`);

    await new Promise((resolve) => setTimeout(resolve, 1500));

  return handleResponse(res);
}

export async function getBooksByGenre(genreId) {
  const res = await fetch(
    `${BASE_URL}/books/?genres__id=${genreId}&page_size=12`
  );

  const data = await handleResponse(res);
  return data.results;
}

export async function getBooksByGenrePaginated(genreId, page = 1) {
  const res = await fetch(
    `${BASE_URL}/books/?genres__id=${genreId}&page=${page}`
  );

  const data = await handleResponse(res);

  return data; // includes results + next
}