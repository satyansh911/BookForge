/**
 * Maps a thrown error onto a sensible HTTP response.
 *
 * Without this, a malformed :id in the URL surfaces as a Mongoose CastError and
 * every controller's generic catch turns it into a 500 — so the frontend shows
 * "server error" for what is really a bad link, and a schema violation looks
 * identical to a crash.
 */
function sendError(res, error, fallbackMessage = 'Server error') {
    if (error?.name === 'CastError') {
        return res.status(404).json({ message: 'Not found (malformed id).' });
    }

    if (error?.name === 'ValidationError') {
        const details = Object.values(error.errors || {})
            .map((e) => e.message)
            .join('; ');
        return res.status(400).json({ message: details || 'Invalid data provided.' });
    }

    // Duplicate key
    if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'value';
        return res.status(400).json({ message: `That ${field} is already taken.` });
    }

    console.error(`${fallbackMessage}:`, error);
    return res.status(500).json({ message: fallbackMessage });
}

module.exports = { sendError };
