# Tutor Atlas waitlist site (V2)

Static tutor-facing waitlist page. British English. No framework, no build step, no env vars.

**Live:** [https://tutor.tutoratlas.sg](https://tutor.tutoratlas.sg) — public go-live for the site/indexing change is approved. See the launch checks below.

## Deploy

GitHub Pages, from the `tutoratlas/tutor-waitlist-page` repo. Push to the default branch and Pages serves it. There is no build: the files in this repo are the files on the host.

`CNAME` holds the custom domain `tutor.tutoratlas.sg`. Do not delete it — Pages drops the custom domain if that file goes missing.

Do not add a build step, a framework, or a dependency. The absence of one is deliberate.

`marketing/` (reels, Seedance, etc.) is kept out by `.gitignore`, along with `LEGAL-TUT-97-DRAFT.md` and `COPY-B2C.md`. `.vercelignore` is a leftover from the old Vercel host and has no effect on Pages; `.gitignore` is what actually keeps `marketing/` off the site.

### This site used to be on Vercel

It was deployed to the Vercel project `tutoratlas-waitlist-v2` under team `jhs-projects-d21b3b22`, at `https://tutoratlas-waitlist-v2.vercel.app`. That address is abandoned. Nothing in this repo should point at it.

## Response headers: what was lost in the move

`vercel.json` used to set three response headers. **GitHub Pages cannot set response headers at all** — it ignored that file completely, so all three stopped being served the moment the domain moved, quietly. The file has been deleted rather than left sitting there implying it still does something. It is in git history (before commit `3cdb8f7`) if the host ever moves back.

| Header it set | Status on GitHub Pages |
|---|---|
| `Referrer-Policy: strict-origin-when-cross-origin` | **Recovered** as `<meta name="referrer">` in `index.html` |
| `X-Robots-Tag: noindex, nofollow` | **Not served.** Search indexing is controlled in files, not headers — see below |
| `X-Content-Type-Options: nosniff` | **Gone, and not recoverable.** There is no markup equivalent |

`X-Content-Type-Options: nosniff` cannot be restored on this host by any change to these files. Do not assume it is being sent. Restoring it needs a host that can set headers — a proxy in front of Pages, or moving off Pages. Same for any future header, including CSP, which is only partially expressible as a `<meta http-equiv>`.

## Search indexing release state

Public go-live is approved for this site/indexing change: the home page is indexable and `robots.txt` no longer disallows crawling `/`. Keep future form-only or copy-only changes from reintroducing a crawl hold unless a new launch decision explicitly says to.

Current indexing controls:

- `index.html` has no page-level `noindex`/`nofollow` robots meta.
- `robots.txt` allows `/` and advertises the canonical sitemap.
- `privacy.html`, `terms.html`, and `404.html` still carry `noindex, nofollow`; they are support pages, not search landing pages.
- ~~`X-Robots-Tag: noindex, nofollow`~~ — no longer served, see above.

Canonical, Open Graph, Twitter, and JSON-LD URLs should name `https://tutor.tutoratlas.sg/`. The policy pages have canonical URLs on the same host.

`sitemap.xml` is present and should stay aligned with the canonical `https://tutor.tutoratlas.sg/` URLs.

## Launch-mechanics checks

Announcement audience, channel, and copy are still unspecified. Do **not** publish or invent an announcement from this repository change alone.

After this change merges, launch still needs GitHub Pages deployment, crawlability, desktop/mobile rendering, policy links, redirects/retired-host evidence, share preview, and one controlled Basin submission verified.

Repeat these before the final walkthrough and again immediately after the go-live search-index flip:

```bash
gh-axi api /repos/tutoratlas/tutor-waitlist-page/pages
curl -sSIL https://tutor.tutoratlas.sg/ \
  https://tutor.tutoratlas.sg/privacy.html \
  https://tutor.tutoratlas.sg/terms.html \
  https://tutor.tutoratlas.sg/sitemap.xml \
  https://tutor.tutoratlas.sg/og-image.png \
  https://tutor.tutoratlas.sg/robots.txt
curl -sSIL https://tutoratlas-waitlist-v2.vercel.app/
```

Expected post-merge evidence:

- GitHub Pages reports `cname: tutor.tutoratlas.sg`, source `main`/`/`, `https_enforced: true`, and an approved certificate for `tutor.tutoratlas.sg`.
- The canonical host returns 200 for `/`, `privacy.html`, `terms.html`, `sitemap.xml`, `og-image.png`, and `robots.txt`.
- `og-image.png` is served as `image/png` and remains 1200x630.
- The old Vercel address `https://tutoratlas-waitlist-v2.vercel.app/` must not serve duplicate waitlist content. During TUT-106 it returned Vercel's plain 404, which is acceptable retirement evidence for this repo. If a product decision later requires redirecting that old host, that is a Vercel project/admin action outside this repository.

## Social preview image

`og:image` is `og-image.png` — 1200x630, declared with `og:image:type`, `og:image:width` and `og:image:height`.

It **must stay a PNG**. It was an SVG, and no major scraper renders SVG for link previews — not WhatsApp, Telegram, LinkedIn, Facebook or X — so every shared link previewed blank.

`og-image.svg` is the source. After editing it, re-raster and commit both:

```bash
rsvg-convert -w 1200 -h 630 -f png -o og-image.png og-image.svg
```

The SVG asks for Georgia and falls back to whatever serif the rasterising machine has, so check the PNG by eye before committing it.

## Reveal animation

`.reveal` is **visible by default**. `script.js` opts in to the fade-up by adding `.js-reveal` to `<html>` only once it knows it can animate and can undo it. So no JS, a blocked `script.js`, or a browser without `IntersectionObserver` all leave the page readable instead of showing a hero and nothing else.

Do not reintroduce a bare `.reveal { opacity: 0 }`.

The observer's `threshold` must stay `0`. A section taller than `viewport / threshold` can never expose that fraction of itself at once and stays hidden forever. Under the old `0.18` this was not theoretical: at 360x400 the two tallest sections measure ~2473px and ~2377px against a 2222px ceiling, and were verified stuck at `opacity: 0` after a full scroll. The `rootMargin`, not the threshold, is what paces the trigger.

The tagline observer still uses `threshold: 0.45`. That was measured at the same viewports — 0.19 max ratio against a 2.22 ceiling — and is fine.

## Form: Basin waitlist

The waitlist form posts to Basin through the public form endpoint committed in `index.html`:

```text
https://usebasin.com/f/0184c01ee34e
```

This is a public form action, not a secret. GitHub Pages does not need a GitHub secret, API key, or build-time environment variable for submissions. If Basin ever requires a credential, do **not** expose it in static HTML or JavaScript; add a server-side proxy or stop and redesign the submission path.

The form collects only:

- name
- Telegram handle
- explicit waitlist consent

It does **not** ask for WhatsApp, student, parent, school, billing, address, or lesson details. The consent checkbox must stay required and unticked by default, and must link to the live `privacy.html` and `terms.html` pages.

`script.js` provides client-side validation, duplicate-submit protection, accessible field errors, clear failure guidance, and on-page success copy. The plain HTML form still has a real Basin `action` for no-JavaScript fallback.

### Basin operations

Production Basin setup for this form is an external pre-live check:

- Form: Tutor Atlas waitlist, endpoint above.
- Retention: set the Basin form/submission retention to **365 days**.
- DPA/terms posture: reflected in `privacy.html`; Basin is the form processor and its DPA is part of Basin's terms.

This repository cannot verify the Basin dashboard setting. Before treating the form as production-ready, log in to Basin and confirm the `0184c01ee34e` form retention is set to 365 days. Do not claim that dashboard setting is configured from repository evidence alone.

Manual deletion procedure:

1. Receive the deletion request at `hello@tutoratlas.sg`.
2. Ask the requester to identify the submitted name or Telegram handle.
3. Confirm control through the submitted Telegram account before deleting, because a public handle is not a stable identity key.
4. In Basin, open the Tutor Atlas waitlist form, search submissions for the matching name or Telegram handle, and delete the matching submission.
5. Reply to confirm deletion once the Basin record is removed.

## What is in this repo (site only)

| File | Role |
|---|---|
| `index.html` | Page |
| `privacy.html` | Waitlist-only privacy notice |
| `terms.html` | Short waitlist terms |
| `styles.css` | Layout and tokens |
| `script.js` | Nav, reveals, Basin form validation/submission |
| `robots.txt` | Crawl allowlist and canonical sitemap reference |
| `sitemap.xml` | Canonical sitemap for the go-live search-index state |
| `CNAME` | Custom domain for GitHub Pages |
| `favicon.svg` | Brand mark |
| `og-image.png` | Social preview (shipped) |
| `og-image.svg` | Social preview source |
| `404.html` | Offline route |
| `.vercelignore` | Leftover from Vercel; inert on Pages |

**Not in this repo:** `marketing/` (reels, Seedance, etc.), `LEGAL-TUT-97-DRAFT.md` (JH counsel draft), `COPY-B2C.md`. All kept out by `.gitignore`.

## Local preview

```bash
python3 -m http.server 5174
# open http://localhost:5174
```
