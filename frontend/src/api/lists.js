import { csrfFetch } from "./client";

export async function createList(name) {
  const res = await csrfFetch("/lists/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to create list");
  }

  return data;
}

export async function addBookToList(listId, bookId) {
  const res = await csrfFetch(`/lists/${listId}/books/`, {
    method: "POST",
    body: JSON.stringify({ book_id: bookId }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error("Failed to add book");

  return data; // 🔥 IMPORTANT
}

export async function removeBookFromList(listId, bookId) {
  const res = await csrfFetch(
    `/lists/${listId}/books/${bookId}/`,
    {
      method: "DELETE",
    }
  );

  const data = await res.json();

  if (!res.ok) throw new Error("Failed to remove book");

  return data; // 🔥 IMPORTANT
}

export async function deleteList(listId) {
  const res = await csrfFetch(`/lists/${listId}/`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete list");
  }

  return true;
}