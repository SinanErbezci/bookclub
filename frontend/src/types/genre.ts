import type { BookListItem } from "./book";

export interface Genre {
  id: number;
  name: string;
}

export interface RandomGenre extends Genre {
  books: BookListItem[];
}