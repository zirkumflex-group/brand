# Agent notes

This repo is the shared look of zirkumflex-group projects. Flexspeak (`zirkumflex-group/flexspeak`, `src/ui/theme.rs` and `docs/design-system.md`) is the reference; this repo follows it, never the other way round.

- `tokens.json` is the source of truth. Never edit `tokens.css` or `shadcn.css` by hand: change `tokens.json`, run `node scripts/build.mjs`, and commit all three.
- Run `bun run check` before committing. It fails if the generated CSS is stale or a colour differs from Flexspeak's default theme.
- A colour change that Flexspeak hasn't made goes to Flexspeak first.
- Keep everything here safe to be public: no details from private repos, no secrets.
- `index.html` is the GitHub Pages site. It reads every value from `tokens.css`; don't hard-code token colours in it.
- Logo SVGs are hand-written: keep them small, with no editor metadata.
