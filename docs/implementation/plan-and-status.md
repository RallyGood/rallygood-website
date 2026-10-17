# Plan and status (checkpoint 1, 2026-10-17)

Resume point for another session. Audit detail is in `audit.md`.

## Constraints for any session
- Pushing or merging to `main` deploys to production (GitHub Pages). Do not push without explicit approval.
- This session cloned read-only. Changes exist only in the local clone until the owner approves pushing and push access is attached.
- Keep "Charity registration pending", "not accepting donations", "illustrative" and "Planned" disclosures unchanged.
- Never publish the placeholder charity number. Do not add placeholder GA/GTM IDs.

## Prioritised sequence

| Pri | Item | Location | Status | Blocker | Owner | Next action |
|---|---|---|---|---|---|---|
| P0 | Correct privacy notice: it denies embedded third-party content but the beehiiv iframe and Web3Forms exist | `src/privacy.page`, `build.mjs` tokens | Not started | Needs trustee review of wording | Raf / trustees | Draft accurate wording locally; do not publish |
| P0 | Inspect cookies/requests set by beehiiv iframe and Web3Forms | live site | Not started | Needs browser inspection | Claude | Load Chrome tools, record cookies and requests |
| P1 | Add JSON-LD (Organization/NGO, WebSite, BreadcrumbList) with no registration number while pending | `layout.html`, `build.mjs` | Not started | None | Claude | Implement locally, validate JSON |
| P1 | Render Example Drop cards in static HTML at build time (keep JS filter) | `drops.page`, `build.mjs`, `script.js` | Not started | None | Claude | Implement locally, run checks |
| P1 | Real `lastmod` in sitemap (from git or file mtime) | `build.mjs` | Not started | None | Claude | Implement locally |
| P1 | Dormant measurement scaffolding: event spec, consent design, disabled loader | docs, `config` | Not started | No GA4 property known | Claude / Raf | Write measurement plan and event spec; no live tag |
| P2 | Per-page OG metadata and image dimensions | `layout.html`, `build.mjs` | Not started | None | Claude | Implement locally |
| P2 | Google for Nonprofits UK eligibility and Ad Grants readiness against current official guidance | docs | Awaiting access/verification | Registration pending; needs official source check | Claude then Raf | Research official pages, record source and date |
| P2 | Reporting specification (Looker Studio) | docs | Not started | No GA4/GSC access | Claude | Spec only; not a connected dashboard |
| P3 | Merchant Center | `merchant-eligibility.md` | Not applicable | No live merchandise | n/a | Record prerequisites only |

## Minimum access and approval requests

| Service / resource | Identifier | Minimum role | Purpose | Owner can do instead? | Blocks |
|---|---|---|---|---|---|
| GitHub `RallyGood/rallygood-website` | repo above | Write (push to a branch, open PR) | Deliver changes as a PR for review | Yes, by applying a patch | Getting changes into the repo |
| Approval to merge | PR | n/a | Merging deploys to production | Owner decision | Production release |
| Google Analytics | unknown | Editor on a RallyGood-owned property | Create stream, verify setup | Yes | Live measurement |
| Search Console | `rallygood.org.uk` | Owner or Full user | Sitemap and index checks | Yes | GSC verification |
| Trustee review | privacy wording | n/a | Policy wording | Raf | Privacy fix publication |

No IDs have been requested or assumed.

## Safe work proceeding now (local only, nothing pushed or deployed)
1. Browser inspection of live cookies and third-party requests.
2. Local changes for the P1 items marked "None" blocker, followed by a local build and the checks I can actually run.
3. Official-source research for Google for Nonprofits, recorded with URL and date.

## Test evidence so far
- `node scripts/build.mjs`: built 12 pages, placeholder-number gate passed (executed this session, local).
- `scripts/check.py`: **not run**.
