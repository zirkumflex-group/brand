# Agent notes

This repo is the shared look of zirkumflex-group projects and the source of truth for it. Projects follow this repo, Flexspeak included; when a colour or token changes here, the projects catch up.

- `tokens.json` is the source of truth. Never edit `tokens.css` or `shadcn.css` by hand: change `tokens.json`, run `node scripts/build.mjs`, and commit all three.
- Run `bun run check` before committing. It fails if the generated CSS is stale, if a colour drops below its contrast floor, or if a logo SVG uses a colour `tokens.json` doesn't name.
- To change a colour, keep its contrast floor (listed in `scripts/check.mjs`) rather than loosening the floor.
- Status colours (`good`, `fair`, `poor`, `unknown`, `live`, `private`) mean something. Charts use `chart-1`…`chart-5`, never status colours.
- Keep everything here safe to be public: no details from private repos, no secrets.
- `index.html` is the GitHub Pages site. It reads every value from `tokens.css`; don't hard-code token colours in it.
- Logo SVGs are hand-written: keep them small, with no editor metadata. The exception is `logo/lockup*.svg`, which `scripts/lockup.mjs` outlines from Inter; rerun it rather than editing them.
