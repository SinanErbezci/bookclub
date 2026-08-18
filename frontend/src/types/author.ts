import type { BookListItem } from "./book";

export interface Author {
  id: number;
  name: string;
  books: BookListItem[];
}