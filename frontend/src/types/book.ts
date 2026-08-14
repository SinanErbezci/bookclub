export interface Genre {
  id: number;
  name: string;
}

export interface Series {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  rating: number;
  num_ratings: number;
  cover: string | null;
  author: number | null;
  author_name: string | null;
  description: string | null;
  pub_date: string | null;
  pages: number | null;
  publisher: number | null;
  publisher_name: string | null;
  genres: Genre[];
  series: Series | null;
  series_num: number | null;
}

export interface BookListItem {
  id: number;
  title: string;
  rating: number;
  cover: string | null;
  author: number | null;
  author_name: string | null;
}

export interface SearchBook {
  id: number;
  title: string;
  cover: string | null;
  author: number | null;
  author_name: string | null;
}

export interface SemanticSearchBook {
  id: number;
  title: string;
  cover: string | null;
  author: number | null;
  author_name: string | null;
  distance: number;
}