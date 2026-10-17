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
| P0 | Inspect cookies/requests set by beehiiv iframe and Web3Forms | live site | **Partly done** 2026-10-17 (see evidence) | Cannot see inside the cross-origin beehiiv iframe; Web3Forms not tested (would send a real message) | Raf | Check beehiiv cookies in Chrome DevTools > Application > Cookies, or accept the "may" wording |
| P1 | JSON-LD (Organization, WebSite, BreadcrumbList), no registration number or legal name while pending | `layout.html`, `build.mjs` (`jsonLd`) | Implemented on branch; JSON parses on all 19 built pages; not run through Google's Rich Results Test | Needs live deploy to test URLs | Claude | Validate after deploy |
| P1 | Example Drop cards rendered statically at build time (JS filter kept) | `drops.page`, `build.mjs` (`DROP_CARDS`) | Implemented on branch; built `drops.html` has 4 cards; card/filter checks passed locally | None | Claude | Confirm after deploy |
| P1 | Remove inaccurate sitemap `lastmod` (CI checkouts are shallow, so git/mtime dates would be equally wrong) | `build.mjs` | Implemented on branch; 0 `lastmod` in built sitemap | None | Claude | Add accurate dates only if a real content-date source is introduced |
| P1 | Measurement plan, consent design, event spec | `measurement-and-consent.md`, `event-specification.csv` | Decisions recorded 2026-10-17 (consent before any measurement; custom `donation_received`, `purchase` for merchandise only). **No code, no tag, no GA4 property** | GA4 property not created (see below); consent banner not built | Raf | Create GA4 property; then I build the consent-gated loader and CSP change on this branch |
| P2 | Social metadata: image width/height/alt, Twitter title/description/image, optional per-page `image` front matter | `layout.html`, `build.mjs` | Implemented on branch; all 19 built pages have the tags | No page-specific artwork exists; every page still uses the one social card (I did not invent images) | Trustees | Supply page-specific images if wanted; check previews after deploy |
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

## GA4 property
Raf asked me to create it if possible. I did not: creating an Analytics account or property means signing in, accepting Google's terms and choosing organisation ownership, which I should not do for you, and I do not know which Google account is organisation-owned. **Owner steps:** sign in with a RallyGood-owned Google account, create an Analytics account and a GA4 property named RallyGood (time zone United Kingdom, currency GBP), add a web data stream for `https://rallygood.org.uk`, switch off Google signals, and send me only the measurement ID (`G-` followed by letters/digits). Do not share passwords.

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
- Live cookie/request inspection (Chrome, 2026-10-17, `https://rallygood.org.uk/`, before any interaction): `document.cookie` empty; `localStorage` and `sessionStorage` empty; one iframe (`subscribe-forms.beehiiv.com`); Resource Timing shows 3 first-party requests and 1 to beehiiv (the iframe document); no Google or other tracker hosts. The network-request tool returned only browser-extension traffic, so request detail comes from Resource Timing. Cookies set by beehiiv inside its own iframe, and what beehiiv's frame loads, are **not visible** to these tools: unverified. The Web3Forms request was not tested. The live site did not yet contain the branch's JSON-LD (0 blocks), as expected.
- Social metadata build check: all 19 built pages contain og:image width/height/alt and Twitter title/description/image tags. `scripts/check.py` was not re-run after this change.
- Not run: Rich Results Test, Lighthouse/CWV, cookie/network inspection of the live site, accessibility audit.
