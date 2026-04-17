const BASE_URL = process.env.REACT_APP_API_URL;

export async function getRecentBooks() {
    const res = await fetch(`${BASE_URL}/books/?ordering=-id&page_size=4`);
    return res.json();
}