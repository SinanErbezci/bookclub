import { apiFetch } from "./client";
import type { UserProfile } from "../types/user";

export async function fetchUserProfile(
  userId: number | string,
): Promise<UserProfile> {
  return apiFetch<UserProfile>(
    `/users/${userId}/profile/`,
  );
}