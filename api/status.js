const net = require('net');

// The game server speaks a raw OSRS binary protocol, not HTTP, so the browser can't check it
// directly - this runs server-side (Vercel serverless function) instead.
//
// A bare TCP connect() is NOT enough: playit's relay accepts the connection at its edge even
// when nothing is actually listening behind the tunnel on the local machine, so "connected"
// fires regardless of whether the game server is really up. Confirmed this by testing both
// states directly - the real signal only shows up once you try to push data through the pipe:
// genuinely online, the server writes back a real handshake response; if the local server is
// down (dead tunnel), the write fails immediately with ECONNRESET instead.
function checkOnline() {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let responded = false;

        const finish = (online) => {
            if (responded) return;
            responded = true;
            socket.destroy();
            resolve(online);
        };

        socket.setTimeout(5000);
        socket.on('connect', () => socket.write(Buffer.from([14])));
        socket.on('data', () => finish(true));
        socket.on('timeout', () => finish(false));
        socket.on('error', () => finish(false));
        socket.on('close', () => finish(false));

        socket.connect(1230, 'morphscape.playit.plus');
    });
}

// Separate playit.gg tunnel (its own tiny read-only HTTP server on the game server, see
// PlayerCountServer.java) - kept as its own endpoint/tunnel rather than a route on the game
// port itself, since the game port only speaks the binary protocol above. Failure here (tunnel
// hiccup, timeout) shouldn't take down the online/offline check - count just comes back null and
// the widget hides the count instead of showing a stale or misleading number.
function fetchCount() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    return fetch('http://theft-concludes.with.playit.plus:1497/players', { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => (typeof data.count === 'number' ? data.count : null))
        .catch(() => null)
        .finally(() => clearTimeout(timeout));
}

module.exports = async (req, res) => {
    const [online, count] = await Promise.all([checkOnline(), fetchCount()]);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ online, count: online ? count : null });
};
