import { apiFetch } from "./client";
import type {
  AddToListResponse,
  CreateListData,
  DeleteListResponse,
  List,
  RemoveFromListResponse,
} from "../types/list";

export async function createList(
  name: string,
): Promise<List> {
  return apiFetch<List>("/lists/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function addBookToList(
  listId: number,
  bookId: number,
): Promise<AddToListResponse> {
  return apiFetch<AddToListResponse>(
    `/lists/${listId}/books/`,
    {
      method: "POST",
      body: JSON.stringify({
        book_id: bookId,
      }),
    },
  );
}

export async function removeBookFromList(
  listId: number,
  bookId: number,
): Promise<RemoveFromListResponse> {
  return apiFetch<RemoveFromListResponse>(
    `/lists/${listId}/books/${bookId}/`,
    {
      method: "DELETE",
    },
  );
}

export async function deleteList(
  listId: number,
): Promise<DeleteListResponse> {
  return apiFetch<DeleteListResponse>(
    `/lists/${listId}/`,
    {
      method: "DELETE",
    },
  );
}

export async function getUserLists(): Promise<List[]> {
  return apiFetch<List[]>("/lists/");
}