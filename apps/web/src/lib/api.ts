/**
 * Thin API client for the Django backend.
 *
 * - Sends the httpOnly JWT cookies on every request (`credentials: 'include'`).
 * - Echoes the `csrftoken` cookie as `X-CSRFToken` on unsafe methods
 *   (dj-rest-auth's JWTCookieAuthentication enforces CSRF).
 * - On a 401, transparently tries `POST /api/auth/token/refresh/` once and
 *   replays the original request. A failed refresh raises `ApiError(401)` and
 *   the caller (AuthProvider) drops to the signed-out state.
 */

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/$/, '');

const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  /** Plain object -> JSON body. Pass FormData/string directly via `rawBody`. */
  json?: unknown;
  rawBody?: BodyInit;
  /** Internal: prevents infinite refresh recursion. */
  _retried?: boolean;
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
      headers: csrfHeaders('POST'),
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function csrfHeaders(method: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (UNSAFE.has(method.toUpperCase())) {
    const token = readCookie('csrftoken');
    if (token) headers['X-CSRFToken'] = token;
  }
  return headers;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...csrfHeaders(method),
    ...(options.headers as Record<string, string> | undefined),
  };

  let body: BodyInit | undefined = options.rawBody;
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    body,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && !options._retried && !path.startsWith('/api/auth/token/refresh')) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _retried: true });
    }
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (payload && typeof payload === 'object' && 'detail' in payload
        ? String((payload as Record<string, unknown>).detail)
        : null) || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}

/** Collapse DRF error payloads into a single human-readable string. */
export function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const d = err.data;
    if (d && typeof d === 'object') {
      const parts: string[] = [];
      for (const [key, val] of Object.entries(d as Record<string, unknown>)) {
        const text = Array.isArray(val) ? val.join(' ') : String(val);
        parts.push(key === 'non_field_errors' || key === 'detail' ? text : `${key}: ${text}`);
      }
      if (parts.length) return parts.join('\n');
    }
    return err.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}
