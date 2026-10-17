# Plan and status (checkpoint 1, 2026-10-17)

Resume point for another session. Audit detail is in `audit.md`.

## Constraints for any session
- Pushing or merging to `main` deploys to production (GitHub Pages). Do not push without explicit approval.
- Push access to the repo was attached on 2026-10-17 so work could go to the branch `claude/implementation-checkpoint`. Nothing has been pushed to `main`.
- Keep "Charity registration pending", "not accepting donations", "illustrative" and "Planned" disclosures unchanged.
- Never publish the placeholder charity number. Do not add placeholder GA/GTM IDs.

## Prioritised sequence

| Pri | Item | Location | Status | Blocker | Owner | Next action |
|---|---|---|---|---|---|---|
| P0 | Correct privacy notice: it denied embedded third-party content but the beehiiv iframe and Web3Forms exist | `src/privacy.page`, `scripts/build.mjs` (`PRIVACY_SITE`) | Implemented on branch, awaiting trustee review before merge | Trustee review; beehiiv cookie behaviour still unverified, so wording says it "may" use cookies | Raf / trustees | Review wording in PR; inspect live cookies in a browser |
| P0 | Inspect cookies/requests set by beehiiv iframe and Web3Forms | live site | Not started | Needs browser inspection | Claude | Load Chrome tools, record cookies and requests |
| P1 | JSON-LD (Organization, WebSite, BreadcrumbList), no registration number or legal name while pending | `layout.html`, `build.mjs` (`jsonLd`) | Implemented on branch; JSON parses on all 19 built pages; not run through Google's Rich Results Test | Needs live deploy to test URLs | Claude | Validate after deploy |
| P1 | Example Drop cards rendered statically at build time (JS filter kept) | `drops.page`, `build.mjs` (`DROP_CARDS`) | Implemented on branch; built `drops.html` has 4 cards; card/filter checks passed locally | None | Claude | Confirm after deploy |
| P1 | Remove inaccurate sitemap `lastmod` (CI checkouts are shallow, so git/mtime dates would be equally wrong) | `build.mjs` | Implemented on branch; 0 `lastmod` in built sitemap | None | Claude | Add accurate dates only if a real content-date source is introduced |
| P1 | Measurement plan, consent design, event spec | `measurement-and-consent.md`, `event-specification.csv` | Specified on branch only; **no code, no tag** | Trustee decision on consent approach; no GA4 property | Raf / trustees | Decide approach; owner creates GA4 property |
| P2 | Per-page OG metadata and image dimensions | `layout.html`, `build.mjs` | Not started | None | Claude | Implement locally |
| P2 | Google for Nonprofits UK eligibility and Ad Grants readiness | `google-for-nonprofits.md` | Assessed from official pages 2026-10-17; **awaiting eligibility** | Charity registration pending; Ad Grants programme eligibility page not retrievable | Raf | Complete registration; confirm no existing GfN account |
| P2 | Reporting specification (Looker Studio) | docs | Not started | No GA4/GSC access | Claude | Spec only; not a connected dashboard |
| P3 | Merchant Center | `merchant-eligibility.md` | Not applicable (decision recorded) | No live merchandise | n/a | Revisit at shop launch |

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
3. (Done) Official-source research for Google for Nonprofits, recorded with URL and date.

## Test evidence so far (local, synthetic; no live-site deploy)
- `node scripts/build.mjs`: built 12 pages, placeholder-number gate passed.
- JSON-LD: parsed with `json.loads` on every built HTML page; types as expected. Not validated with Google Rich Results Test or Schema.org validator (not available here).
- `python3 scripts/check.py` against local `dist/` (Playwright): 19 pages x 2 viewports, links, nav, Drops filter, split calculator, shop checks ran. Three items flagged:
  1. `/nope.html` console error x2: the browser's own message for the deliberate 404 test page. Inference: pre-existing, not caused by these changes (baseline not re-run).
  2. Contact form success state: the script expects the old mailto fallback, but config now uses Web3Forms and this sandbox's network blocks `api.web3forms.com`, so the request failed. Real submission was **not** tested.
  3. beehiiv iframe also blocked by the sandbox network, so its behaviour and cookies are **unverified**.
- Not run: Rich Results Test, Lighthouse/CWV, cookie/network inspection of the live site, accessibility audit.
