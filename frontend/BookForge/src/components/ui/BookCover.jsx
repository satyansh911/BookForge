import { useState, useEffect } from "react";
import { resolveAssetUrl } from "../../utils/config";

/**
 * A book cover that degrades to a readable placeholder.
 *
 * Most books have no uploaded cover, and the previous `onError` handler reset
 * `src` to "" — which makes the browser re-request the current page, get HTML
 * back, and fire `onError` again. This renders a typographic placeholder
 * instead of chasing a broken image.
 */
const PALETTE = [
  ["#AD4733", "#F3E4DE"],
  ["#2D4739", "#E3EDE5"],
  ["#2B3A55", "#E1E7F2"],
  ["#5A3E5D", "#EFE4F0"],
  ["#7A5C1E", "#F5EBD6"],
];

const BookCover = ({ src, title = "", className = "", imgClassName = "" }) => {
  const resolved = resolveAssetUrl(src);
  const [failed, setFailed] = useState(false);

  // A different book (or a freshly uploaded cover) deserves another attempt.
  useEffect(() => setFailed(false), [resolved]);

  if (resolved && !failed) {
    return (
      <img
        src={resolved}
        alt={title || "Book cover"}
        loading="lazy"
        className={imgClassName || className}
        onError={() => setFailed(true)}
      />
    );
  }

  const clean = (title || "Untitled").trim();
  const initials =
    clean
      .split(/\s+/)
      .filter((w) => /[a-z0-9]/i.test(w))
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "?";

  // Stable colour per title, so a given book always looks the same.
  let hash = 0;
  for (let i = 0; i < clean.length; i++) hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  const [bg, fg] = PALETTE[hash % PALETTE.length];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${className}`}
      style={{ backgroundColor: bg, color: fg }}
      role="img"
      aria-label={clean}
    >
      <span className="text-4xl font-serif font-bold tracking-tight leading-none">{initials}</span>
      <span className="mt-2 px-3 text-[10px] uppercase tracking-[0.18em] opacity-80 line-clamp-2">
        {clean}
      </span>
    </div>
  );
};

export default BookCover;
