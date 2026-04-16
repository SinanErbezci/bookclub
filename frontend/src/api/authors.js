const BASE_URL = "http://localhost:8000/api";

export async function getRandomAuthor() {
    const res = await fetch(`${BASE_URL}/authors/random`);
    return res.json();
}

