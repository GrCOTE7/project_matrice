const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const getDjangoBaseUrl = () =>
  import.meta.env.VITE_DJANGO_URL ||
  window.location.origin ||
  "http://localhost:8001";

const base64UrlDecode = (value) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  return atob(padded);
};

const parseJwt = (token) => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
};

const isTokenExpired = (token, leewaySeconds = 30) => {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - leewaySeconds <= now;
};

export const getTokens = () => ({
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
});

export const setTokens = ({ access_token, refresh_token }) => {
  if (access_token) localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const login = async (username, password) => {
  const response = await fetch(`${getDjangoBaseUrl()}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  setTokens(data);
  return data;
};

export const refreshAccessToken = async () => {
  const { refreshToken } = getTokens();
  if (!refreshToken) throw new Error("Missing refresh token");

  const response = await fetch(`${getDjangoBaseUrl()}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Refresh failed");
  }

  setTokens(data);
  return data;
};

export const authFetch = async (input, init = {}) => {
  const tokens = getTokens();

  if (!tokens.accessToken || isTokenExpired(tokens.accessToken)) {
    await refreshAccessToken();
  }

  const { accessToken } = getTokens();
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(input, { ...init, headers });
  if (response.status !== 401) return response;

  await refreshAccessToken();
  const retryHeaders = new Headers(init.headers || {});
  retryHeaders.set("Authorization", `Bearer ${getTokens().accessToken}`);
  return fetch(input, { ...init, headers: retryHeaders });
};

export const hasValidSession = () => {
  const { accessToken, refreshToken } = getTokens();
  if (accessToken && !isTokenExpired(accessToken)) return true;
  return Boolean(refreshToken);
};
