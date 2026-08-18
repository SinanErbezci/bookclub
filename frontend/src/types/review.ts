export interface ReviewUser {
  id: number;
  username: string;
}

export interface ReviewBook {
  id: number;
  title: string;
  cover: string | null;
  author_name: string;
}

export interface Review {
  id: number;
  user: ReviewUser;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
  book: ReviewBook;
}

export interface CreateReviewData {
  book: number;
  rating: number;
  content: string;
}

export interface UpdateReviewData {
  rating: number;
  content: string;
}