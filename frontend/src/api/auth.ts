import { apiFetch } from "./client";
import type {
  LoginData,
  SignupData,
} from "../types/auth";
import type { MeResponse, User } from "../types/user";

export async function loginUser(
  data: LoginData,
): Promise<User | null> {
  await apiFetch<void>("/login/", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return getCurrentUser();
}

export async function signupUser(
  data: SignupData,
): Promise<User | null> {
  await apiFetch<void>("/signup/", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return getCurrentUser();
}

export async function getCurrentUser(): Promise<User | null> {
  const data = await apiFetch<MeResponse>("/me/");

  return data.user;
}

export async function logoutUser(): Promise<void> {
  await apiFetch<void>("/logout/", {
    method: "POST",
  });
}