# Setting up Morphscape donations (the legal way)

The `/support` page is built and live-ready. To actually take money, you need to create a
payout account on a donation platform. **You have to do this part yourself** — it requires your
real identity and bank details, which I can't (and shouldn't) enter for you. It's ~15 minutes.

## The one rule that keeps this legal

**Donations fund your *original* work and grant nothing in-game.** No coins, no items, no ranks,
no advantage — ever. The rewards are original digital content (lore, art, music you made), a
Discord role, and website recognition. That's the line between a legal donation and an illegal
sale of game content built on Jagex's assets. The `/support` page is already worded this way —
don't add in-game rewards to it.

Also: the game itself stays free-to-play. That's both the ethical promise and what keeps the
server off Jagex's radar.

## Step 1 — Pick a platform

Recommended, in order:

1. **Ko-fi** (https://ko-fi.com) — best default. Free to use, low fees, supports one-time tips
   *and* monthly memberships, and pays out to PayPal or Stripe. Creator-friendly.
2. **Patreon** (https://patreon.com) — if you mainly want recurring monthly members with tiered
   original-content delivery.
3. **Buy Me a Coffee** — simple one-time tips.

You can use Ko-fi for everything. Frame your page around **"an original indie world / creative
project"** — the Morphscape Saga, the art, the development. Do **not** describe it as a
"RuneScape private server store." Keep the public money-facing identity about your original IP.

## Step 2 — Create the account (you do this)

1. Sign up on the platform with your own email.
2. Complete their identity/payout setup (connect your PayPal or bank — this is why only you can
   do it).
3. Set your page name/handle, e.g. `ko-fi.com/morphscape`.
4. If using memberships/tiers, create tiers that match the `/support` page: Supporter, Patron,
   Loremaster, Founder — with the **same rewards** (Discord role, wallpapers, lore, recognition).
   Never a game reward.

## Step 3 — Give me (or paste in) your links

Open `support.html`, find the `DONATION_LINKS` block near the bottom, and replace the placeholder
`https://ko-fi.com/` with your real URLs — e.g.:

```js
var DONATION_LINKS = {
    supporter:  'https://ko-fi.com/morphscape',
    patron:     'https://ko-fi.com/morphscape/tiers',
    loremaster: 'https://ko-fi.com/morphscape/tiers',
    founder:    'https://ko-fi.com/morphscape/tiers',
    any:        'https://ko-fi.com/morphscape'
};
```

(Or just tell me your handle and I'll wire the exact links.)

## Step 4 — Deliver what you promise

Consumer-protection basics — don't take money for rewards you can't deliver:

- Only list rewards you actually have or can make (you already own the Saga lore and the logo;
  wallpapers are easy; only promise a soundtrack once it exists).
- Deliver reward content via Discord roles and digital downloads within a few days.
- Keep the "generally non-refundable, voluntary gift" wording that's already on the page.

## What NOT to do (these re-break the law)

- ❌ Don't sell coins, gear, ranks, boxes, or any in-game item/advantage — cosmetic included.
- ❌ Don't make donations grant *anything* that shows up in-game.
- ❌ Don't run paid loot boxes / mystery boxes (that's gambling law on top of everything).
- ❌ Don't describe the payment page as a store for the RuneScape server.

## Going live

The site is on Vercel (`cleanUrls`), so `/support` works automatically on deploy. Push the repo
(or your normal Vercel deploy) and the new Support page replaces the old coins store, which now
redirects to `/support`.
