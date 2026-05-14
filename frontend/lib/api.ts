export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('prelegal_token');
}

export function setToken(token: string, email: string): void {
  localStorage.setItem('prelegal_token', token);
  localStorage.setItem('prelegal_email', email);
}

export function clearAuth(): void {
  localStorage.removeItem('prelegal_token');
  localStorage.removeItem('prelegal_email');
}

export function getEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('prelegal_email');
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}
