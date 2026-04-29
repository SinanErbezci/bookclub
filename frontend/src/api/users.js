const BASE_URL = process.env.REACT_APP_API_URL;

export async function fetchUserProfile(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/profile/`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }

  return res.json();
}