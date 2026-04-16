const BASE_URL = "http://localhost:8000/api";

export async function getRandomGenre() {
    const res = await fetch(`${BASE_URL}/genres/random`);
    return res.json();
}

