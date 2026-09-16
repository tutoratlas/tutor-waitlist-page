# Tutor Atlas waitlist site (V2)

Static tutor-facing waitlist page. British English. No framework, no build step, no env vars.

**Live:** [https://tutor.tutoratlas.sg](https://tutor.tutoratlas.sg) — held out of search, form off. See both holds below.

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
| `X-Robots-Tag: noindex, nofollow` | **Not served.** The hold still holds by other means — see below |
| `X-Content-Type-Options: nosniff` | **Gone, and not recoverable.** There is no markup equivalent |

`X-Content-Type-Options: nosniff` cannot be restored on this host by any change to these files. Do not assume it is being sent. Restoring it needs a host that can set headers — a proxy in front of Pages, or moving off Pages. Same for any future header, including CSP, which is only partially expressible as a `<meta http-equiv>`.

## SEO hold (do not lift yet)

The page is deliberately out of search until the waitlist form is ready. The draft waitlist privacy notice and terms now exist, but the form remains off. Flip these together on the day the form starts taking real submissions, not before:

- `<meta name="robots" content="noindex, nofollow">` on `index.html` and `404.html`
- `robots.txt`: `User-agent: *` / `Disallow: /`
- ~~`X-Robots-Tag: noindex, nofollow`~~ — no longer served, see above

The hold was three layers and is now two. Both remaining layers are real and working, but it is thinner than it looks.

Canonical and Open Graph URLs now correctly name `https://tutor.tutoratlas.sg/`.

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

## Form: disabled

The waitlist form **does not collect and does not submit**. Submit is disabled. There is **no** `WAITLIST_ENDPOINT` and **no** POST to `example.com` or any placeholder.

Tutor-facing copy: the waitlist **opens shortly**.

**Form-back lock** (when the form returns — not now):

- name + Telegram handle (not WhatsApp)
- explicit consent checkbox, unticked by default
- live privacy policy URL on the form before any real submit
- real endpoint we control

`privacy.html` and `terms.html` are draft waitlist-only pages pending captain and jiehao review. They do not re-enable collection. TUT-99 is the review of styling, SEO flip, PDPA consent, and the form.

## What is in this repo (site only)

| File | Role |
|---|---|
| `index.html` | Page |
| `privacy.html` | Draft waitlist-only privacy notice |
| `terms.html` | Draft short waitlist terms |
| `styles.css` | Layout and tokens |
| `script.js` | Nav, reveals, form lock |
| `robots.txt` | `Disallow: /` |
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
