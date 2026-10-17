# Plan and status (checkpoint 2, 2026-10-17)

Resume point for another session. Audit detail is in `audit.md`.

## Update, checkpoint 2
PR #2 was merged to `main` by Raf and the Pages deploy run succeeded; the live site was inspected afterwards (home page JSON-LD, og:image dimensions, consent banner and `region1.google-analytics.com` requests after accepting). Rows below that say "on branch" or "not deployed" describe the state at checkpoint 1; read them with this update. Still unverified live: first-visit consent in a private window, GA4 receiving and processing data (check Realtime), beehiiv iframe cookies, live Web3Forms submission, Rich Results Test, Lighthouse/field data. The trustee review of the now-live privacy wording is outstanding.

## Owner confirmations, 2026-10-18 (reported by Raf in chat; not independently verified by me)
- First-visit consent behaviour checked by Raf and approved.
- GA4 admin settings applied as per the checklist in `measurement-and-consent.md`.
- Trustees reviewed and approved the live privacy wording.
- GA4 shows data: one visit logged (so GA4 receipt is confirmed; volume is too small to assess anything).
- Search Console: not yet configured (steps in `search-console-setup.md`).
- Open: mark `contact_form_submit` as a key event once it appears; beehiiv cookies; live Web3Forms test; Rich Results Test; PageSpeed.

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
| P1 | Consent-gated GA4 (`G-WQH6PTFD4X`), banner, CSP, privacy text, 3 events | `src/consent.js`, `build.mjs`, `layout.html`, `footer.html`, `styles.css`, `script.js`, `scripts/consent-test.py`, `measurement-and-consent.md`, `event-specification.csv` | **Merged and deployed (PR #2). Tested locally with Google stubbed (30/30). Live: banner and analytics requests after accept observed; GA4 data receipt not confirmed** | Trustee review of privacy text; Raf's GA4 admin steps; merge approval | Raf / trustees | Review PR; follow GA4 owner checklist; after deploy verify in Realtime/DebugView |
| P2 | Social metadata: image width/height/alt, Twitter title/description/image, optional per-page `image` front matter | `layout.html`, `build.mjs` | Implemented on branch; all 19 built pages have the tags | No page-specific artwork exists; every page still uses the one social card (I did not invent images) | Trustees | Supply page-specific images if wanted; check previews after deploy |
| P2 | Google for Nonprofits UK eligibility and Ad Grants readiness | `google-for-nonprofits.md` | Assessed from official pages 2026-10-17; **awaiting eligibility** | Charity registration pending; Ad Grants programme eligibility page not retrievable | Raf | Complete registration; confirm no existing GfN account |
| P2 | Reporting specification (Looker Studio) | `reporting-specification.md` | Spec written (docs PR); no dashboard exists | No GA4/GSC access | Raf | Build only when Google account access exists |
| P2 | Performance sample, Search Console steps, image/schema audit, SEO and content plan | `performance.md`, `search-console-setup.md`, `image-and-schema-audit.md`, `seo-and-content-plan.md` | Written (docs PR). Lab sample only; Search Console steps not checked against current Google docs | Search Console verification (DNS TXT, owner approval) | Raf | Follow `search-console-setup.md`; run PageSpeed and Rich Results Test manually |
| P3 | Merchant Center | `merchant-eligibility.md` | Not applicable (decision recorded) | No live merchandise | n/a | Revisit at shop launch |

## Minimum access and approval requests

| Service / resource | Identifier | Minimum role | Purpose | Owner can do instead? | Blocks |
|---|---|---|---|---|---|
| GitHub `RallyGood/rallygood-website` | repo above | Write (push to a branch, open PR) | Deliver changes as a PR for review | Yes, by applying a patch | Getting changes into the repo |
| Approval to merge | PR | n/a | Merging deploys to production | Owner decision | Production release |
| Google Analytics | property created by Raf; measurement ID `G-WQH6PTFD4X` received | none needed from me now | Owner configures admin settings (checklist in `measurement-and-consent.md`) | Yes | Live verification after deploy |
| Search Console | `rallygood.org.uk` | Owner or Full user | Sitemap and index checks | Yes | GSC verification |
| Trustee review | privacy wording | n/a | Policy wording | Raf | Privacy fix publication |

No IDs have been requested or assumed.

## GA4 property
Created by Raf; measurement ID received 2026-10-17 and wired into the branch. I did not create or access the property.

## Next work (local, nothing deployed)
1. Reporting specification (Looker Studio), spec only.
2. SEO/content plan and image/schema audit documents.
3. Performance check after deploy.

## Test evidence so far (local, synthetic; no live-site deploy)
- `node scripts/build.mjs`: built 12 pages, placeholder-number gate passed.
- JSON-LD: parsed with `json.loads` on every built HTML page; types as expected. Not validated with Google Rich Results Test or Schema.org validator (not available here).
- `python3 scripts/check.py` against local `dist/` (Playwright): 19 pages x 2 viewports, links, nav, Drops filter, split calculator, shop checks ran. Three items flagged:
  1. `/nope.html` console error x2: the browser's own message for the deliberate 404 test page. Inference: pre-existing, not caused by these changes (baseline not re-run).
  2. Contact form success state: the script expects the old mailto fallback, but config now uses Web3Forms and this sandbox's network blocks `api.web3forms.com`, so the request failed. Real submission was **not** tested.
  3. beehiiv iframe also blocked by the sandbox network, so its behaviour and cookies are **unverified**.
- Live cookie/request inspection (Chrome, 2026-10-17, `https://rallygood.org.uk/`, before any interaction): `document.cookie` empty; `localStorage` and `sessionStorage` empty; one iframe (`subscribe-forms.beehiiv.com`); Resource Timing shows 3 first-party requests and 1 to beehiiv (the iframe document); no Google or other tracker hosts. The network-request tool returned only browser-extension traffic, so request detail comes from Resource Timing. Cookies set by beehiiv inside its own iframe, and what beehiiv's frame loads, are **not visible** to these tools: unverified. The Web3Forms request was not tested. The live site did not yet contain the branch's JSON-LD (0 blocks), as expected.
- Social metadata build check: all 19 built pages contain og:image width/height/alt and Twitter title/description/image tags. `scripts/check.py` was not re-run after this change.
- Consent matrix (`scripts/consent-test.py`, Google hosts stubbed): 30/30 passed. `scripts/check.py` re-run with the banner present: same three items as before, nothing new.
- Not run: Rich Results Test, Lighthouse/CWV, cookie/network inspection of the live site, accessibility audit.
