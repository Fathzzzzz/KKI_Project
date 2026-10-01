# Reverse-engineering report — `dzakyr.github.io/lfsr-stream-cipher/`

Target: <https://dzakyr.github.io/lfsr-stream-cipher/>
Source repo: <https://github.com/DzakyR/lfsr-stream-cipher> (public, branch `main`)
Extracted: 2026-09-27

---

## 1. Verdict: what built the app

**Nothing. There is no framework, no library, and no build step.**

The page is hand-written **vanilla HTML + CSS + JavaScript**, served as static files straight
off GitHub Pages. That is the whole stack.

| Question | Answer |
|---|---|
| Framework | **None** — no React / Vue / Svelte / Angular / Solid / Preact / Alpine / Lit / htmx |
| CSS framework | **None** — no Tailwind / Bootstrap. Hand-written CSS with custom properties |
| CSS preprocessor | **None** — raw `.css` is served, no `.scss`/`.less` artifacts, no source maps |
| Bundler / build | **None** — no `package.json`, no webpack/vite/rollup/esbuild config, no `dist/` |
| Package manager deps | **Zero.** Not one npm dependency, runtime or dev |
| Test runner | Node's built-in `node:test` (`node --test tests/lfsr.test.cjs`) — zero install |
| Hosting | GitHub Pages (`server: GitHub.com`), `.nojekyll` present so files are served byte-for-byte |
| Language (GitHub classification) | JavaScript |

### Evidence

The entire deployed repository is **8 files**:

```
blob       10 .gitignore
blob        0 .nojekyll          <- disables Jekyll; raw static hosting
blob     1051 README.md
blob    16215 css/style.css
blob    18472 index.html
blob    28369 js/app.js
blob    10452 js/lfsr.js
blob     4573 js/testcases.js
blob     3237 tests/lfsr.test.cjs
```

No `package.json` anywhere in the tree. No lockfile, no `node_modules`, no config for any
tool. The README's own run instructions are `python3 -m http.server 8080` — a static file
server, not a dev server. There is nothing to compile.

### Fidelity check

The five files fetched from the live site are **byte-identical** to the repo's raw files
(sha256 verified):

```
MATCH  d06613bd81ea  index.html
MATCH  0bc8fa10a8e1  css/style.css
MATCH  9535a7e8beb5  js/lfsr.js
MATCH  7dbfc86cf72b  js/testcases.js
MATCH  2fe130536a57  js/app.js
```

Total uncompressed payload: **78,081 bytes** (HTML 18,472 · CSS 16,215 · JS 43,394).
No minification, no hashed filenames, no code splitting.

---

## 2. Architecture

Three IIFE modules using a plain global-namespace pattern, with a UMD-ish guard so the same
files run in the browser *and* under Node:

```js
(function (root) {
  'use strict';
  /* ... */
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LFSR = api;                       // -> window.LFSR
})(typeof window !== 'undefined' ? window : globalThis);
```

| File | Lines | Role | Touches DOM? |
|---|---|---|---|
| `js/lfsr.js` | 255 | Crypto core: validation, LFSR stepping, keystream, period, byte/bit/hex conversion, XOR cipher, seed search | **No** — pure functions |
| `js/testcases.js` | 120 | 12 test cases with expected values; shared by the web page and the Node suite | No |
| `js/app.js` | 668 | UI layer: forms, error display, SVG diagram, tables, attack animation | Yes |

That separation is the design decision worth copying: the same `testcases.js` drives the
in-page "Jalankan semua uji" button **and** `node --test`, so the browser demo and the CLI
suite can never drift apart.

**Rendering approach.** Direct DOM manipulation — `querySelector`, `innerHTML` with
template-literal strings, `addEventListener` on a few forms. The LFSR register diagram is an
inline `<svg>` whose children are generated as an HTML string and assigned to `svg.innerHTML`
(`buildDiagram()` in `app.js`), then updated per-clock by toggling classes. No virtual DOM,
no reactivity, no template engine.

**Escaping.** A single `esc()` helper wraps every interpolated user string; `textContent` is
used for anything that doesn't need markup.

---

## 3. CSS

One 469-line hand-written file. Characteristics:

- **Design tokens** as custom properties on `:root` — a full palette (`--paper`, `--ink`,
  `--ink-2`, `--high`, `--tap`, `--pass`, `--fail`, …), two radii, and two font stacks.
- **Modern selectors**: `:has()` is used for the segmented control
  (`.segmented label:has(input:checked)`), `:focus-visible` for keyboard-only outlines,
  `clamp()` for fluid type, `color-scheme: light`.
- **Layout**: CSS Grid for the two-column hero/split/`dl` spec/seed grid; Flexbox for bars
  and forms. No float hacks, no framework grid classes.
- **Responsive**: two breakpoints only — `max-width: 900px` and `max-width: 600px` — plus a
  `prefers-reduced-motion: reduce` block that kills transitions/animations and disables
  smooth scrolling.
- **Accessibility**: `[aria-invalid="true"]` styling, `:focus-visible` rings on every
  interactive element, `scroll-margin-top` so sticky-header anchors don't hide content,
  `aria-live="polite"` on all result regions.
- **Class naming**: semantic/BEM-ish (`.panel`, `.result-row`, `.tile.hit`, `.stage-num`),
  not utility soup — further confirmation there is no Tailwind.

---

## 4. Third-party surface

Tiny and non-essential:

- **Google Fonts**: `Martian Mono` (400,600) + `Schibsted Grotesk` (400,500,700,800), with
  `preconnect` hints and a **non-blocking load trick** —
  `media="print" onload="this.media='all'"` — so a missing network never blocks render; the
  CSS declares system fallbacks (`Avenir Next`, `system-ui`, `SF Mono`, `Menlo`).
- **Favicon**: an inline `data:image/svg+xml` URL. No favicon file request.
- **No** analytics, tag managers, cookies, service worker, CDN scripts, or API calls.
  Response headers carry no CSP; `access-control-allow-origin: *` and
  `cache-control: max-age=600` come from GitHub Pages defaults.

Everything except the web fonts works fully offline — consistent with the README's claim.

---

## 5. What this means if you want to rebuild or extend it

- To reproduce it you need **only a static file server**. `python3 -m http.server` is enough.
- There is nothing to un-bundle: the deployed JS is already the readable source, comments
  included. This is the rare case where "reverse engineering" is just *reading*.
- Adding a framework would be a net loss here — the page is ~1,900 lines total across five
  files and has no state that benefits from a component model.
- If you wanted a modern upgrade path, the natural one is: keep `lfsr.js` untouched (it is
  DOM-free and already unit-tested), and add a bundler only if you introduce npm deps. The
  UMD guard means the core file would survive that move unchanged.

---

## 6. Deliverables

The faithful extraction described above (index.html, css/, js/, standalone build) has been
**superseded by the React port** that now lives in this folder — see `README.md`. The original
vanilla files are preserved byte-for-byte at:

```
~/Works/General/lfsr-reverse-engineering/source/     the five deployed files + Node test
~/Works/General/lfsr-reverse-engineering/standalone/ the single-file build
```

The two files that came from the React port, kept here:

```
src/lib/lfsr.js       the original js/lfsr.js, converted to ESM (logic unchanged)
src/lib/testcases.js  the original js/testcases.js, converted to ESM (logic unchanged)
tests/lfsr.test.mjs   the original tests/lfsr.test.cjs, ported to ESM
```

### Verification performed

- `node --test tests/lfsr.test.cjs` on the extracted source → **18/18 pass** (12 shared
  cases + 6 extra unit tests).
- `standalone/index.html` opened in a real browser from `file://`:
  - page renders, SVG register diagram builds, 20-bit keystream generated, 20-row clock
    trace table populated;
  - in-page test button → **12 dari 12 PASS**;
  - encrypt `HELLO` (n=4, seed 1011, taps 4,3) → `9FCCE35F11`;
  - decrypt that back → `HELLO`;
  - seed-search attack on Alice's message → all 3 stages render, seed recovered
    (`0111`, attempt 7 of 15), full plaintext
    `RAHASIA: temu di gerbang utara jam 7` decrypted.

Both the extracted bundle and the single-file build are confirmed working, not just present.
