import type { List } from "./list";
import type { Review } from "./review";

export interface User {
  id: number;
  username: string;
}

export interface UserProfile {
  user: User;
  lists: List[];
  reviews: Review[];
}

export interface MeResponse {
  user: User | null;
}