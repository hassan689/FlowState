const ACCESS = 'flowstate_access_token';
const REFRESH = 'flowstate_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS);
}

export function setTokens({ access_token, refresh_token }) {
  localStorage.setItem(ACCESS, access_token);
  localStorage.setItem(REFRESH, refresh_token);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}

function apiBase() {
  return import.meta.env.VITE_API_URL || '';
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const body = options.body;
  const isJsonObject =
    body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob);
  if (isJsonObject && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const url = path.startsWith('http') ? path : `${apiBase()}${path}`;
  const init = {
    ...options,
    headers,
    body: isJsonObject ? JSON.stringify(body) : body,
  };

  let res = await fetch(url, init);
  if (res.status === 401 && localStorage.getItem(REFRESH)) {
    const r = await fetch(`${apiBase()}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: localStorage.getItem(REFRESH) }),
    });
    if (r.ok) {
      const tok = await r.json();
      setTokens(tok);
      headers.set('Authorization', `Bearer ${getAccessToken()}`);
      res = await fetch(url, { ...init, headers });
    }
  }
  return res;
}
