
import { ApiError, type ApiErrorResponse } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL;

let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;

async function getCsrfToken(): Promise<string> {
  // 1. Return cached token
  if (csrfToken) {
    return csrfToken;
  }

  // 2. Reuse an in-flight request
  if (csrfRequest) {
    return csrfRequest;
  }

  // 3. Fetch and cache a new token
  csrfRequest = (async () => {
    const res = await fetch(`${BASE_URL}/csrf/`, {
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok || !data.csrfToken) {
      throw new ApiError(
        data.detail ?? "Failed to obtain CSRF token",
        res.status,
        data,
      );
    }

    const token: string = data.csrfToken;
    csrfToken = token;
    return csrfToken;
  })();

  try {
    return await csrfRequest;
  } finally {
    csrfRequest = null;
  }
}

export function invalidateCsrfToken(): void {
  csrfToken = null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  // Add CSRF token only for unsafe methods
  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    const token = await getCsrfToken();
    headers.set("X-CSRFToken", token);
  }

  if (typeof options.body === "string" &&
      !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = path.startsWith("http")
    ? path
    : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  let data: unknown = null;

  try {
    data = await res.json();
  } catch {
    // Some responses have no JSON body.
  }

  if (!res.ok) {
    // A stale token may produce a 403.
    // Refresh on the next write request, without
    // automatically replaying the current request.
    if (res.status === 403) {
      invalidateCsrfToken();
    }

    const errorData = data as ApiErrorResponse | null;

    const message =
      errorData?.message ??
      errorData?.detail ??
      errorData?.error ??
      "Something went wrong";

    throw new ApiError(message, res.status, data);
  }

  return data as T;
}
