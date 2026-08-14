import { ApiError, type ApiErrorResponse } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL;

interface ApiFetchOptions extends RequestInit {}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const csrfRes = await fetch(`${BASE_URL}/csrf/`, {
    credentials: "include",
  });

  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;

  const url = path.startsWith("http")
    ? path
    : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
      ...(options.headers || {}),
    },
    ...options,
  });

  let data: unknown = null;

  try {
    data = await res.json();
  } catch {
    // Some responses have no JSON body.
  }

  if (!res.ok) {
    const errorData = data as ApiErrorResponse | null;

    const message =
      errorData?.message ??
      errorData?.detail ??
      errorData?.error ??
      "Something went wrong";

    throw new ApiError(
      message,
      res.status,
      data,
    );
  }

  return data as T;
}