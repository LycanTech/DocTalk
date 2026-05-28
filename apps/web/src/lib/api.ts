const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetcher<T>(path: string): Promise<T> {
  const token = typeof window !== "undefined"
    ? sessionStorage.getItem("doctalk-access-token")
    : null;

  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }

  return res.json();
}

export function getAuthHeader(): Record<string, string> {
  const token = typeof window !== "undefined"
    ? sessionStorage.getItem("doctalk-access-token")
    : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = typeof window !== "undefined"
    ? sessionStorage.getItem("doctalk-access-token")
    : null;

  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(init?.headers ?? {}),
    },
  });
}
