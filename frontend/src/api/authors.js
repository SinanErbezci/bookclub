const BASE_URL = process.env.REACT_APP_API_URL;

export async function getRandomAuthor() {
    const res = await fetch(`${BASE_URL}/random/author/`);
    return res.json();
}

export async function getAuthorById(id) {
    const res = await fetch(`${BASE_URL}/authors/${id}`);
    const data = await res.json();
    return data;
}

