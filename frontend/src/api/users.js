import { apiFetch } from "./client";

// 👤 FETCH USER PROFILE
export async function fetchUserProfile(userId) {
  const data = await apiFetch(`/users/${userId}/profile/`);

  // 🔥 normalize response ONCE here
  return data?.user
    ? data
    : {
        user: data,
        lists: data?.lists || [],
        reviews: data?.reviews || [],
      };
}