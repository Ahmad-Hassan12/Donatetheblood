/**
 * Backend proxy helper.
 *
 * Every /api/* route in this app is a thin pass-through to the real backend
 * (from the separate Node.js app), so the frontend stays a pure UI and all
 * data/logic lives server-side.
 *
 * Requests keep their path, query string, method, headers and body, and the
 * backend response (including `Set-Cookie` for sessions) is returned as-is.
 *
 * Set NEXT_PUBLIC_API_URL in .env / .env.local to point at the backend, e.g.
 *   NEXT_PUBLIC_API_URL=http://localhost:4000
 */

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

/** Headers that are hop-by-hop and must never leak to the backend. */
const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "content-length",
  "transfer-encoding",
  "upgrade",
]);

/**
 * Headers to strip from the upstream response before returning it to the
 * browser.  `fetch()` auto-decompresses the body when the server sends a
 * Content-Encoding header (gzip, br, zstd, …), but the original
 * Content-Encoding / Content-Length / Transfer-Encoding headers are still
 * present — telling the browser the body is compressed when it no longer is,
 * which triggers ERR_CONTENT_DECODING_FAILED.
 */
const STRIP_FROM_RESPONSE = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
]);

/**
 * Forwards an inbound request to the backend at `NEXT_PUBLIC_API_URL`,
 * preserving path, query, method, headers and body. Returns the upstream
 * response untouched so cookies/session headers propagate to the browser.
 *
 * If NEXT_PUBLIC_API_URL is unset, or the backend cannot be reached, a JSON
 * error is returned instead of crashing the route.
 */
export async function proxyToBackend(
  request: Request,
  path?: string
): Promise<Response> {
  if (!API_BASE_URL) {
    return Response.json(
      { error: "Backend not configured — set NEXT_PUBLIC_API_URL in .env/.env.local." },
      { status: 503 }
    );
  }

  const incoming = new URL(request.url);
  // Default: map the frontend path (/api/...) to the backend's versioned
  // path (/api/v1/...). Pass an explicit `path` to override this mapping.
  const targetPath =
    path ??
    incoming.pathname.replace(/^\/api\//, "/api/v1/");
  const target = new URL(targetPath + incoming.search, API_BASE_URL);

  const headers = new Headers(request.headers);
  for (const name of HOP_BY_HOP) headers.delete(name);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
    // `manual` (not `follow`) so the backend's Set-Cookie / 3xx semantics are
    // passed straight through to the browser instead of being dropped when a
    // redirect is followed.
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (error) {
    console.error(`[backend proxy] ${request.method} ${targetPath} failed:`, error);
    return Response.json(
      { error: "Backend is unreachable. Please try again later." },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  for (const name of STRIP_FROM_RESPONSE) responseHeaders.delete(name);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}