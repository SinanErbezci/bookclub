export interface SearchBook {
  id: number;
  title: string;
  cover: string | null;
  author: number;
  author_name: string;
}

export interface SearchAuthor {
  id: number;
  name: string;
}

export interface SearchGenre {
  id: number;
  name: string;
}

export interface SemanticSearchBook {
  id: number;
  title: string;
  cover: string | null;
  author: number;
  author_name: string;
  distance: number;
}

export interface SearchResponse {
  books: SearchBook[];
  books_count: number;
  next?: string | null;
  previous?: string | null;
  authors: SearchAuthor[];
  genres: SearchGenre[];
}