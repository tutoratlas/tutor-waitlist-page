# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

Static waitlist page. **No build step, no framework, no dependencies** — the files in this repo are the files on the host. Keep it that way; the absence of a toolchain is deliberate.

Hosted on **GitHub Pages** at `tutor.tutoratlas.sg` (`CNAME`). It used to be on Vercel — ignore any Vercel-shaped instruction you find.

`README.md` is authoritative for deploy, the search-indexing release state, the response headers that Pages cannot send, and how to re-raster the OG image. Read it before changing `index.html`, `styles.css`, or `script.js`.

Sharp edges that have each already been broken once, all explained in `README.md`:

- **GitHub Pages cannot set response headers.** `X-Content-Type-Options: nosniff` is gone and is not recoverable here. Do not assume any header is being served.
- **`og:image` must stay a PNG.** No major scraper renders SVG for link previews. `og-image.svg` is only the source.
- **`.reveal` must stay visible by default**; `script.js` opts in to the animation via `.js-reveal`. A bare `.reveal { opacity: 0 }` blanks the whole page below the hero whenever the script fails to run.
- **The reveal observer's `threshold` must stay `0`.** A section taller than `viewport / threshold` can never expose that fraction of itself and stays hidden forever.

The public home page is approved for search indexing: do not reintroduce the home-page `noindex` meta or a `robots.txt` crawl disallow without a new launch decision. Privacy, terms, and 404 remain support pages with `noindex`; see `README.md` for the current indexing state. The waitlist form itself is wired through Basin; `README.md` is authoritative for the endpoint, consent requirements, retention check, and deletion procedure.

Verify changes against the rendered page, not only the source — several of the above look fine in the markup.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
