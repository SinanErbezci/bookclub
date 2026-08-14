import { apiFetch } from "./client";

export async function fetchUserProfile(userId: number | string) {
  const data = await apiFetch(`/users/${userId}/profile/`);

  return data?.user
    ? data
    : {
        user: data,
        lists: data?.lists || [],
        reviews: data?.reviews || [],
      };
}