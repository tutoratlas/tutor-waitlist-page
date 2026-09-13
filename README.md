# Tutor Atlas waitlist site (V2)

Static tutor-facing waitlist page. British English. No framework, no env vars.

**Live (JH Vercel, hold):** [https://tutoratlas-waitlist-v2.vercel.app](https://tutoratlas-waitlist-v2.vercel.app)

Intended later host: `tutor.tutoratlas.sg` (TUT-67 / TUT-98). Do not flip SEO to index until that cutover and a real form endpoint exist.

## Deploy

This copy still deploys to Vercel project **`tutoratlas-waitlist-v2`** under team **`jhs-projects-d21b3b22`**.

```bash
# From this folder. marketing/ must not ship — see .vercelignore
npx vercel --prod --yes
```

No environment variables. No serverless functions. No redirects configured beyond `vercel.json` (`cleanUrls`, `trailingSlash: false`, security + `X-Robots-Tag`).

`.vercelignore` excludes `marketing/`, `.git`, `*.md`, and `.DS_Store`. Do not remove `marketing` from that list.

Han Wei may later serve the same files from GitHub Pages in the `tutoratlas` org. That is a hosting change, not a change to these files.

## SEO hold (do not lift yet)

- `<meta name="robots" content="noindex, nofollow">` on `index.html` and `404.html`
- `robots.txt`: `User-agent: *` / `Disallow: /`
- `X-Robots-Tag: noindex, nofollow` on all routes

**Stale canonicals:** `index.html` still declares canonical / Open Graph URLs on `https://tutoratlas-waitlist-v2.vercel.app/`. Those must change on domain cutover. Do not treat them as the destination.

## Form: disabled

The waitlist form **does not collect and does not submit**. Submit is disabled. There is **no** `WAITLIST_ENDPOINT` and **no** POST to `example.com` or any placeholder.

Tutor-facing copy: the waitlist **opens shortly**.

**Form-back lock** (when the form returns — not now):

- name + Telegram handle (not WhatsApp)
- explicit consent checkbox, unticked by default
- live privacy policy URL on the form before any real submit
- real endpoint we control

TUT-99 is the review of styling, SEO flip, PDPA consent, and the form after this handover.

## What is in this repo (site only)

| File | Role |
|---|---|
| `index.html` | Page |
| `styles.css` | Layout and tokens |
| `script.js` | Nav, reveals, form lock |
| `robots.txt` | `Disallow: /` |
| `favicon.svg` / `og-image.svg` | Brand assets |
| `404.html` | Offline route |
| `vercel.json` | Static headers (JH Vercel project) |
| `.vercelignore` | Keeps `marketing/` off the host |

**Not in this repo / not for this deploy:** `marketing/` (reels, Seedance, etc.). Keep it local or a separate path. Do not push it with the site.

**Local only, not for the org repo:** `LEGAL-TUT-97-DRAFT.md` (JH counsel draft).

## Local preview

```bash
python3 -m http.server 5174
# open http://localhost:5174
```
