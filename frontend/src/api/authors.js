const BASE_URL = process.env.REACT_APP_API_URL;

export async function getRandomAuthor() {
    const res = await fetch(`${BASE_URL}/authors/random/`);
    return res.json();
}

