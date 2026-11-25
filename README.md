# jdleo.me

Static site. No framework, no build-time dependencies beyond `marked`.

- `node build.mjs` generates `dist/` (pages, .md twins, sitemap, RSS, llms.txt)
- `node og-gen.mjs` regenerates the social cards in `assets-og/` (needs a local Chromium)
- `api/` holds the only server code: the hit counter, per-post view counts, and the /x/ short-link resolver - all backed by the project's Vercel Postgres.
