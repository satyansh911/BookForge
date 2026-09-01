/**
 * Single source of truth for the API origin.
 *
 * This used to be copy-pasted into axiosInstance and four separate components,
 * each defaulting to `http://localhost:8000` — a port the backend has never
 * listened on. Without VITE_BASE_URL set, that made every API call and every
 * backend-served cover image fail in local development.
 *
 * The default is 4000 to match backend/server.js, which avoids 5000 because
 * macOS gives that port to the AirPlay Receiver.
 */

function resolveBaseUrl() {
  let base = import.meta.env.VITE_BASE_URL || (import.meta.env.DEV ? "http://localhost:4000" : "");

  // Tolerate a value that includes the /api suffix — the paths already carry it.
  if (base.endsWith("/api")) base = base.slice(0, -4);
  // Tolerate a trailing slash so `${BASE_URL}${path}` never doubles up.
  if (base.endsWith("/")) base = base.slice(0, -1);

  return base;
}

export const BASE_URL = resolveBaseUrl();

/**
 * Turns whatever an image field holds into something the browser can load.
 *
 * Three kinds of value flow through here:
 *   1. Absolute URLs / data: / blob:      → pass through untouched.
 *   2. Backend upload paths (/uploads/…)  → prefixed with the API origin.
 *   3. Frontend bundle assets             → left alone, so the Vite dev server
 *      (/src/assets/… in dev,               or the static host serves them.
 *       /assets/….png in prod)
 *
 * Case 3 is the one that matters: those come from `import img from '...'`, and
 * blindly prefixing them with the API origin pointed the landing page's
 * featured covers at the backend, which does not serve them — every one came
 * back ERR_BLOCKED_BY_ORB and rendered as a broken image.
 */
export function resolveAssetUrl(value) {
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const normalised = trimmed.replace(/\\/g, "/");
  const withSlash = normalised.startsWith("/") ? normalised : `/${normalised}`;

  // Only paths the API actually serves get the API origin.
  if (withSlash.startsWith("/uploads/")) {
    return `${BASE_URL}${withSlash}`;
  }

  return withSlash;
}
