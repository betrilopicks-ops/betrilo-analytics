# @betrilopicks Project Book Versions

FE: BFEv0.39.7

## BFEv0.37.1 — og:image absolute URL + twitter:card fix (2026-10-13)

og:image changed from %PUBLIC_URL%/appicon_512.png (relative, breaks in OG
crawlers) to https://betrilo.com/appicon_512.png (absolute). twitter:card
changed from summary_large_image to summary (square icon, not wide banner).
Applies to all routes via index.html; gen-route-meta inherits both.

## BFEv0.37.0 — NFL accuracy transparency + side-by-side (2026-10-13)

NFL projections page (/nfl/projections) now shows:
1. **Side-by-side**: model projection + consensus book line + difference inline
   in each stat cell. Sortable "Gap" column for finding biggest disagreements.
2. **Accuracy section**: per-market ratio cards with human-readable labels
   ("X% more/less accurate than the market line"), loaded from
   nfl_accuracy_latest.json.
3. **Updated banner**: replaces "NO TRACK RECORD" with measured accuracy
   disclosure. Keeps amber treatment. Includes responsible gambling notice.

noindex/nofollow KEPT — no market individually qualifies under the published
standard (ratio <=1.05x, n>=150, CI upper <1.15x). Revisit at Week 8.

Data contract: FE reads nfl_accuracy_latest.json (NFL-side export).
Page gracefully degrades if the file is missing (accuracy section hidden).
