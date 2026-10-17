# RallyGood implementation audit (checkpoint 1)

Date: 2026-10-17. Method: shallow clone of `RallyGood/rallygood-website` (HEAD `1000ecb`), local build (`node scripts/build.mjs`, Node 22.22.0, 12 indexable pages), and fetches of the live site via WebFetch. Direct `curl` to rallygood.org.uk is blocked by the session proxy (403), so response headers and redirect behaviour are **not verified**.

## 1. Capabilities actually available (verified this session)

| Capability | Status |
|---|---|
| GitHub repo access | Read-only anonymous clone. `add_repo` with push access was **not** requested. No push, no PRs, no Actions visibility. |
| Local filesystem, shell, Node 22 | Yes. Local build ran. |
| Playwright / browser tests | Not verified. `scripts/check.py` needs Playwright, which has not been run. |
| Web fetch of live site | Yes (WebFetch). Raw curl blocked. |
| Browser extension (Chrome) / network inspection | Tools exist but not loaded or used yet. |
| Google accounts (GA4, GSC, GfN, Looker, Merchant) | No access verified. No connector tried. |
| Payment provider sandbox | None exists. |
| Deployment / DNS | Not accessible. Deploy is GitHub Actions on push to `main`. |

## 2. Operating stage (observed)

Pre-launch, registration pending. Evidence: banner "Charity registration pending · We are not yet accepting donations" on every page; footer says not registered with the Charity Commission and that Drops are illustrative; `config/site.config.json` has `registrationStatus: "pending"` and `shopStatus: "preview"`; the build fails if the placeholder charity number leaks (local build passed that gate); `OUTSTANDING.md` states no bank account, payment provider, Gift Aid wording, delivery partner or real Drop exists. No donate button exists. Terminology "Drops" is used throughout. Shop is a preview: six product pages are `noindex`, Buy button disabled, sample prices and images.

## 3. Repository and deployment (observed)

- Repo `RallyGood/rallygood-website`, public, single branch `main`, one merge commit visible in the shallow clone (PR #1 `add-shop-coming-soon`). Full history, open PRs and other branches were not inspected.
- Static site: `src/*.page` + `layout.html` + partials built by dependency-free `scripts/build.mjs` into `dist/`. Shop pages generated from `config/shop.json`.
- Deploy: `.github/workflows/deploy.yml`, GitHub Pages via Actions on **every push to `main`** (so any merge is a production deploy). No lint/tests in CI; `scripts/check.py` is manual.
- Hosting per README (not independently verified): GitHub Pages, Cloudflare DNS (DNS-only records), Microsoft 365 email records. The README line "Enforce HTTPS" step is described as pending; live HTTPS was reached via WebFetch.
- No `package.json`, no lockfile, no `.env.example`.

## 4. Measurement and consent (observed)

No Google tag, GTM, dataLayer, analytics or consent tool exists. `script-src 'self'` in the CSP meta tag would block a Google tag until changed. Privacy page states the site uses no cookies or analytics. Nothing to measure against yet because no donation, checkout or provider exists.

## 5. Gap analysis

| # | Pri | Finding | Evidence | Status |
|---|---|---|---|---|
| 1 | P0 | Privacy notice says the site has no "embedded third-party content", but the homepage/footer newsletter is a beehiiv iframe, and the contact form calls Web3Forms from the browser. The CSP also allows both. | `src/privacy.page` L19; `src/partials/newsletter-embed.html`; `config/site.config.json` | Inaccurate disclosure. Needs wording fix and trustee review. Whether beehiiv sets cookies is **unverified**. |
| 2 | P0 | Newsletter embed is loaded on page view with no choice, so any cookies or tracking it sets cannot be confirmed as consent-compatible. | Same | Unverified; needs browser cookie/network inspection. |
| 3 | P1 | No structured data (Organization/NGO, WebSite, BreadcrumbList). | grep of `src`, `scripts` | Gap. Must not state a charity number or registration. |
| 4 | P1 | `sitemap.xml` sets `lastmod` to build date for every page, which misstates when content changed. | `scripts/build.mjs`; live sitemap shows 2026-10-17 on all 12 URLs | Gap. |
| 5 | P1 | Example Drops cards are rendered by JavaScript from `/data/drops.json`; built `drops.html` contains 0 cards. Crawlers that do not run JS see no Drop content. | `grep -c drop-card dist/drops.html` = 0 | Gap. |
| 6 | P1 | OG image is the same site-wide card for every page; no per-page images; no `og:image:width/height/alt`. Social card is 1200x630 PNG (good). | `src/layout.html` | Gap (P2). |
| 7 | P1 | No analytics or consent foundation. Pre-launch, so only dormant, disabled scaffolding is justified. | n/a | Planned. |
| 8 | P2 | Contact form accessibility/spam: Web3Forms key is in client config (public by design); `botcheck` is sent empty. | `src/script.js` | Note only. |
| 9 | P2 | Security headers unavailable on GitHub Pages; CSP is a meta tag, so `frame-ancestors` is not enforced. | `OUTSTANDING.md` item 14 | Optional (Cloudflare rules). |
| 10 | P2 | Redirect and domain variants (www, http) not verifiable here. | curl blocked | Unverified. |
| 11 | P2 | No test or lint in CI; check script depends on Playwright. | `deploy.yml` | Optional. |
| 12 | P2 | Google for Nonprofits: eligibility unverified. Registration pending; a pending application does not establish eligibility. | `OUTSTANDING.md` item 6 | Awaiting official guidance check and owner evidence. |
| 13 | n/a | Merchant Center: shop is preview only, nothing on sale, no checkout, sample products. | `config/shop.json`, `shopStatus: "preview"` | Not applicable now. |

Placeholder charity number `1234567890` appears only in config; the build gate prevents publication while pending.

## 6. Observed vs inferred

- Observed: items above marked with file or fetch evidence.
- Inferred: that beehiiv/Web3Forms may set cookies or store data; that crawlers will miss Drop cards.
- Unverified: live response headers, redirects, HTTPS enforcement state, Cloudflare settings, Google account ownership, DNS, email authentication, any open PRs or other branches.
