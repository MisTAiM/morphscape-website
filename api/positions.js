// Proxies PlayerCountServer's /positions route (same tunnel as status.js's count check) so the
// browser never talks to the playit.gg tunnel directly. That server already excludes anyone in
// the Wilderness and anyone staff has hidden via ::hide - this function does not re-filter
// anything, it's a passthrough with a timeout and a safe fallback.
module.exports = async (req, res) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const upstream = await fetch('http://theft-concludes.with.playit.plus:1497/positions', {
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
