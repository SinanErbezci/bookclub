const BASE_URL = process.env.REACT_APP_API_URL;

export async function getRandomGenre() {
    const res = await fetch(`${BASE_URL}/genres/random/`);
    return res.json();
}

