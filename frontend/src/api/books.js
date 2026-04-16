const BASE_URL = "http://localhost:8000/api";

export async function getRecentBooks() {
    const res = await fetch(`${BASE_URL}/books/?ordering=-id&page_size=4`);
    return res.json();
}