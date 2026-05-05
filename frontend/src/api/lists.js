import { apiFetch } from "./client";

// ➕ CREATE LIST
export async function createList(name) {
  return await apiFetch("/lists/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// ➕ ADD BOOK
export async function addBookToList(listId, bookId) {
  const data = await apiFetch(`/lists/${listId}/books/`, {
    method: "POST",
    body: JSON.stringify({ book_id: bookId }),
  });

  // 🔥 normalize expected response
  return {
    created: data?.created ?? true,
    ...data,
  };
}

// ➖ REMOVE BOOK
export async function removeBookFromList(listId, bookId) {
  const data = await apiFetch(
    `/lists/${listId}/books/${bookId}/`,
    {
      method: "DELETE",
    }
  );

  return {
    deleted: data?.deleted ?? true,
    ...data,
  };
}

// ❌ DELETE LIST
export async function deleteList(listId) {
  await apiFetch(`/lists/${listId}/`, {
    method: "DELETE",
  });

  return true;
}