import type { BookListItem } from "./book";

export interface List {
  id: number;
  name: string;
  books: BookListItem[];
  is_system: boolean;
}

export interface CreateListData {
  name: string;
}

export interface AddToListResponse {
  success: boolean;
  created: boolean;
}

export interface RemoveFromListResponse {
  success: boolean;
  deleted: boolean;
}

export interface DeleteListResponse {
  success: boolean;
}