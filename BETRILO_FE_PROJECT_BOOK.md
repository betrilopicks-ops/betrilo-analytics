# @betrilopicks Frontend (betrilo.com) — Technical Project Book

**Version:** BFEv0.1.1 | **Last Updated:** June 25, 2026 | **Includes:** Footer tagline fix

---

## 1. Overview

betrilo-analytics is the React 19 frontend for betrilo.com, deployed on Vercel. It serves MLB Batter-vs-Pitcher analytics, daily pick cards, track record pages, and landing content. All data is consumed from static JSON/CSV exports produced by the sport backend pipelines.

**Stack:** React 19, react-router-dom v7, CRA (react-scripts 5), Vercel

---

## 2. Session Logs

### Session: June 24, 2026 — BFEv0.1.0 → BFEv0.1.1

**Summary:** Footer tagline copy edit — "Sports Betting Projections" → "Sports Betting Analytics" to match the site's public identity.

| File | Change |
|---|---|
| `src/components/Footer.jsx` | Line 12: "Projections" → "Analytics" |

**Build:** `CI=true npm run build` — passed clean, exit 0.

### Session: June 25, 2026 — BFEv0.1.2 VOIDED (no-op)

**Summary:** footer-wording-fix ran through the full /feature pipeline but resolved as NO-OP — main already read "Sports Betting Projections" since commit `54a7e5e`. The routing-nav localhost branch was 33 commits behind main, so testing verified a stale site. No code shipped. Version bump to BFEv0.1.2 reverted to BFEv0.1.1. Captured two follow-up items: stale-localhost-branch fix and no-op status model enhancement.
