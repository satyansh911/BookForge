const axios = require('axios');

/**
 * Thin, failure-tolerant wrapper around the Google Books API.
 *
 * The anonymous quota is small and shared per source IP, so a burst of reader
 * page views reliably earns a 429. That used to propagate as a 500 and break
 * the reader sidebar. Related books and purchase links are enrichment, never
 * load-bearing — so a failed lookup returns null and callers degrade instead.
 *
 * A short in-process cache keeps repeat views of the same book off the wire
 * entirely, which is what causes most of the rate limiting in the first place.
 */

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const MAX_ENTRIES = 500;
const cache = new Map();

function getCached(key) {
    const hit = cache.get(key);
    if (!hit) return undefined;
    if (Date.now() - hit.at > CACHE_TTL_MS) {
        cache.delete(key);
        return undefined;
    }
    return hit.value;
}

function setCached(key, value) {
    if (cache.size >= MAX_ENTRIES) {
        // Cheap eviction: drop the oldest inserted key.
        cache.delete(cache.keys().next().value);
    }
    cache.set(key, { value, at: Date.now() });
}

/**
 * @returns {Promise<Array|null>} volume items, or null when the lookup failed
 *          for any reason (rate limit, network, upstream outage).
 */
async function searchVolumes(title, maxResults = 5) {
    const key = `${title}::${maxResults}`;
    const cached = getCached(key);
    if (cached !== undefined) return cached;

    try {
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=${maxResults}`;
        const response = await axios.get(url, { timeout: 8000 });
        const items = response.data?.items || [];
        setCached(key, items);
        return items;
    } catch (error) {
        const status = error.response?.status;
        if (status === 429) {
            console.warn('Google Books rate limit hit — serving without enrichment.');
        } else {
            console.warn('Google Books lookup failed:', status || error.code || error.message);
        }
        // Cache the miss briefly so a rate-limited burst does not keep retrying.
        setCached(key, null);
        return null;
    }
}

module.exports = { searchVolumes };
