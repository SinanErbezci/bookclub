const BASE_URL = process.env.REACT_APP_API_URL;

export async function getRandomGenre() {
    const res = await fetch(`${BASE_URL}/random/genre/`);
    return res.json();
}

export async function getGenreById(id) {
  const res = await fetch(`${BASE_URL}/genres/${id}/`);
  if (!res.ok) throw new Error("Failed to fetch genre");
  return res.json();
}