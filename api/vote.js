const https = require('https');

// Receives the vote-site postback (GET /api/vote?callback=username, or ?i=/?username=/?player=/?user=
// depending on which vote site is calling) and appends {username, timestamp} to votes-queue.json on
// the "data" branch of this repo via the GitHub Contents API. That branch is NOT wired to Vercel's
// auto-deploy, so writes here never trigger a site redeploy - it's purely a small shared data file.
//
// The game server itself is behind NAT/playit with no public HTTP port available for a direct
// webhook (see VoteQueuePoller.java), so this function is the public-facing half: it only ever
// writes to GitHub, it never talks to the game server directly. The game server polls
// raw.githubusercontent.com for this file's current content on its own schedule.
//
// Requires a Vercel env var GITHUB_TOKEN: a fine-grained GitHub Personal Access Token scoped to
// just this repo with "Contents: Read and write" permission.

const OWNER = 'MisTAiM';
const REPO = 'morphscape-website';
const BRANCH = 'data';
const PATH = 'votes-queue.json';

function githubRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const req = https.request({
            hostname: 'api.github.com',
            path,
            method,
            headers: {
                'User-Agent': 'morphscape-vote-callback',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github+json',
                ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
            },
        }, (res) => {
            let chunks = '';
            res.on('data', (c) => chunks += c);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(chunks); } catch (e) { parsed = null; }
                resolve({ status: res.statusCode, body: parsed });
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

function extractUsername(query) {
    for (const key of ['i', 'callback', 'username', 'player', 'user']) {
        const value = query[key];
        if (typeof value === 'string' && value.trim().length > 0) return value.trim();
    }
    return null;
}

module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    // Logged so the real incoming request (from rsps.dev's tester or a live vote) is visible in
    // Vercel's Function Logs - the ground truth if a vote-site's callback still fails after this.
    console.log('vote callback hit:', req.url, JSON.stringify(req.query || {}));

    const query = req.query || {};

    // rsps.dev's Legacy tester appends "&test_mode=true" and a placeholder "test_user" username
    // rather than a real one - since we don't validate usernames against anything, this was never
    // actually the cause of the 400 seen in their dashboard, but short-circuiting it here is cheap
    // and matches their documented behavior exactly.
    if (query.test_mode === 'true' || query.test_mode === '1') {
        res.status(200).json({ ok: true, test: true });
        return;
    }

    const username = extractUsername(query);
    if (!username) {
        res.status(400).json({ ok: false, error: "Missing username query parameter (expected one of: i, callback, username, player, user).", receivedUrl: req.url });
        return;
    }

    if (!process.env.GITHUB_TOKEN) {
        res.status(500).json({ ok: false, error: 'Server misconfigured: GITHUB_TOKEN not set.' });
        return;
    }

    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const getResp = await githubRequest('GET', `/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`);
            if (getResp.status !== 200) {
                res.status(502).json({ ok: false, error: 'Failed to read vote queue from GitHub.', detail: getResp.body });
                return;
            }

            const currentContent = Buffer.from(getResp.body.content, 'base64').toString('utf8');
            let queue;
            try { queue = JSON.parse(currentContent); } catch (e) { queue = []; }
            if (!Array.isArray(queue)) queue = [];

            queue.push({ username, timestamp: Date.now() });

            const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
            const putResp = await githubRequest('PUT', `/repos/${OWNER}/${REPO}/contents/${PATH}`, {
                message: `vote: ${username}`,
                content: newContent,
                sha: getResp.body.sha,
                branch: BRANCH,
            });

            if (putResp.status === 200 || putResp.status === 201) {
                res.status(200).json({ ok: true });
                return;
            }

            if (putResp.status === 409) continue; // sha conflict - another vote landed concurrently, retry

            res.status(502).json({ ok: false, error: 'Failed to write vote queue to GitHub.', detail: putResp.body });
            return;
        } catch (e) {
            res.status(500).json({ ok: false, error: String(e) });
            return;
        }
    }

    res.status(503).json({ ok: false, error: 'Too many concurrent votes, please retry.' });
};
