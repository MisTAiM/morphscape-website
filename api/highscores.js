// Proxies PlayerCountServer's /highscores route (same tunnel as status.js/positions.js) so the
// browser never talks to the playit.gg tunnel directly. That server rebuilds its own snapshot at
// most once an hour from the real character saves, so this is just a passthrough with a timeout
// and a safe fallback - no extra caching needed here on top of it.
module.exports = async (req, res) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const upstream = await fetch('http://theft-concludes.with.playit.plus:1497/highscores', {
            signal: controller.signal,
        });
        const data = await upstream.json();
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json(Array.isArray(data) ? data : []);
    } catch (e) {
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json([]);
    } finally {
        clearTimeout(timeout);
    }
};
