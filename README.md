# RallyGood website (rallygood.org.uk)

Static multi-page site. Source in `src/`, built to `dist/` by `node scripts/build.mjs` (no dependencies), deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Config
`config/site.config.json` holds the domain, contact email (`info@rallygood.org.uk`) and charity registration details.

- `registrationStatus: "pending"` → every page shows **"Charity registration pending"**. The placeholder `charityNumber` (`1234567890`) is **never** written to the built site; the build fails if it leaks.
- When registration completes: set the real `charityNumber`, set `registrationStatus` to `"registered"`, review the wording noted in `OUTSTANDING.md`, push to `main`.

## Hosting status (set up 2 Oct 2026)
- GitHub: `RallyGood/rallygood-website` (public), Pages source = GitHub Actions, custom domain `rallygood.org.uk`.
- Cloudflare (RallyGood account, free plan): zone `rallygood.org.uk` with the GitHub A/AAAA/`www` records below (all DNS-only) plus the Microsoft 365 email records (MX, SPF, MS verification TXT, `autodiscover`).
- Namecheap nameservers set to `henry.ns.cloudflare.com` / `ines.ns.cloudflare.com`.
- After Cloudflare shows the zone Active and GitHub's DNS check passes: tick **Enforce HTTPS** in GitHub Pages settings.

## Hosting setup (reference)
1. Create a GitHub repo (e.g. `rallygood-website`), push this folder to `main`.
2. Repo → Settings → Pages → Source: **GitHub Actions**. Custom domain: `rallygood.org.uk`; tick **Enforce HTTPS** once the certificate is issued.
3. Cloudflare DNS for `rallygood.org.uk` (set the records to **DNS only / grey cloud** until GitHub has issued the certificate):
   - `A` `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` `www` → `rallygood.github.io`
   - Recommended: verify the domain in GitHub (Settings → Pages → Add a domain) to prevent takeover.
   - Cloudflare: SSL/TLS mode **Full**; optionally redirect `www` → apex with a Redirect Rule.
4. Email (`info@rallygood.org.uk`): add MX records for whichever mailbox provider or Cloudflare Email Routing you use, plus SPF/DKIM/DMARC. The website only links to this address.

## Shop
The shop is generated from `config/shop.json` by `scripts/shop.mjs` (shop page, product pages, homepage block). It stays in preview (Buy merchandise disabled) until `shopStatus` is `"live"`; the build refuses that unless the charity is registered and every product is confirmed with a checkout link. See `OUTSTANDING.md` → Shop.

## Checks
`python3 scripts/check.py http://localhost:8099` (needs Playwright) checks status codes, console errors, internal links/anchors, mailto addresses, horizontal overflow at desktop and 390px, nav, filters, split calculator and form validation. Serve `dist/` first: `cd dist && python3 -m http.server 8099`.

## Contact form
The form posts to Web3Forms using the public access key in `config/site.config.json`, which emails submissions to `info@rallygood.org.uk`. If sending fails the page tells the visitor to email directly. Without a key the build falls back to a `mailto:` link.

## Analytics and consent
Google Analytics 4 is set by `ga4MeasurementId` in `config/site.config.json` and loads only after a visitor accepts the cookie banner (`src/consent.js`). Remove the ID to turn analytics off completely; the CSP and privacy text adjust automatically. Details: `docs/implementation/measurement-and-consent.md`.

## More checks
- `node scripts/ci-check.mjs` (after a build) checks links, page metadata, sitemap, no Google script before consent, and that pre-launch disclosures remain. It also runs on every pull request (`.github/workflows/check.yml`).
- `python3 scripts/consent-test.py` (needs Playwright, serve `dist/` first) runs the 30-check consent matrix.
- Planning docs live in `docs/implementation/`; unpublished drafts in `docs/templates/`.
