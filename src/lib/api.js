const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const API_BASE_URL = rawApiBaseUrl.endsWith("/") ? rawApiBaseUrl.slice(0, -1) : rawApiBaseUrl;

function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE_URL === "/api" && normalizedPath.startsWith("/api/")) {
    return normalizedPath;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function apiBinaryRequest(path, { method = "GET", token, body } = {}) {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const filenameHeader = response.headers.get("content-disposition");
  const filenameMatch = filenameHeader?.match(/filename="?([^"]+)"?/i);
  return {
    blob,
    filename: filenameMatch?.[1] || "document.pdf",
  };
}
