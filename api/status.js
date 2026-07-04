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
module.exports = (req, res) => {
    const socket = new net.Socket();
    let responded = false;

    const finish = (online) => {
        if (responded) return;
        responded = true;
        socket.destroy();
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json({ online });
    };

    socket.setTimeout(5000);
    socket.on('connect', () => socket.write(Buffer.from([14])));
    socket.on('data', () => finish(true));
    socket.on('timeout', () => finish(false));
    socket.on('error', () => finish(false));
    socket.on('close', () => finish(false));

    socket.connect(1230, 'morphscape.playit.plus');
};
