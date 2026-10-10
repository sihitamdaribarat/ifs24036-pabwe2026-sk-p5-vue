/* global DELCOM_BASEURL */
export const BASE_URL = DELCOM_BASEURL;
export const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function putAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Membangun URL lengkap beserta query parameters.
 * Parameter bernilai undefined, null, atau string kosong diabaikan.
 */
export function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}

/**
 * Wrapper fetch ke REST API Delcom.
 * - Menambahkan header Authorization: Bearer <token> otomatis.
 * - Body berupa FormData dikirim apa adanya, selain itu di-JSON-kan.
 * - Melempar Error bila status response bukan "success".
 */
export async function fetchApi(path, options = {}) {
  const { method = "GET", params, body } = options;
  const headers = { Accept: "application/json" };

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const init = { method, headers };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, params), init);
  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.status !== "success") {
    const fields = json.data?.field;
    let message = json.message || `Request gagal (${response.status})`;
    if (Array.isArray(fields) && fields.length > 0) {
      message = `${message}: ${fields.join(", ")}`;
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return json;
}
