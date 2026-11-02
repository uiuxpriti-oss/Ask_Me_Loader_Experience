# Ask Me — AI Progress Loader

Calm, enterprise-ready progress loader for AI analytics. Groups 50–100+ backend steps into 4–6 phases, with progressive disclosure down to agent IN/OUT and the SQL used.

## Run
Open `index.html` in a browser — no build step. Deploys as-is to Netlify / GitHub Pages / Vercel.

## Files
| Path | What |
|---|---|
| `index.html` | Ideation 1 — full prototype (standalone, offline) |
| `loader-header-only.html` | Just the animated header + steps (plain HTML/CSS/JS) |
| `loader.css` | Design tokens + component CSS |
| `src/` | Editable Design Component sources (`*.dc.html`) + `support.js` runtime |

## Design tokens
- **Font:** Inter (UI), JetBrains Mono (code/metadata)
- **Type scale (base 14 · ×1.125):** 18 / 16 / 14 / 12 / 10 px
- **Color:** Tailwind slate, 800 darkest (no 900) · blue-600 for loader glyph motion only · green success · `#B4472B` error
- **Surfaces:** pure white; code area slate-50; hairlines slate-200

## Structure
```
loader → header (glyph · label · timer · chevron)
  └ phase → grey icon · title · duration · chevron
      └ narration + hairline rail
          └ agent (name + subtext) → IN/OUT · SQL code (scrolls) · error card
```

## States
Initial (collapsed) · active · completed · expanded · IN/OUT · SQL view · long-running · error + auto-retry · hard failure · heavy run (4 SQL + 3 charts + 106-line batch).
