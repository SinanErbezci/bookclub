import { getCookie } from "../utils/cookies";
const BASE_URL = process.env.REACT_APP_API_URL;

export async function loginUser(data) {
    await fetch(`${BASE_URL}/csrf/`, {
        credentials: "include",
    });

    const res = await fetch(`${BASE_URL}/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include", // 🔥 IMPORTANT
        body: JSON.stringify(data),
    });


    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.error || "Login failed");
    }

    return result;
}

export async function getCurrentUser() {
    const res = await fetch(`${BASE_URL}/me/`, {
        credentials: "include",
    });

    return res.json();
}

export async function logoutUser() {
    await fetch(`${BASE_URL}/csrf/`, {
        credentials: "include",
    });

    await fetch(`${BASE_URL}/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
        }
    });
}

export async function signupUser(data) {
    await fetch(`${BASE_URL}/csrf/`, {
        credentials: "include",
    });

    const res = await fetch(`${BASE_URL}/signup/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.error || "Signup failed");
    }

    return result;
}