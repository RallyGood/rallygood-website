# RallyGood website (rallygood.org.uk)

Static multi-page site. Source in `src/`, built to `dist/` by `node scripts/build.mjs` (no dependencies), deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Config
`config/site.config.json` holds the domain, contact email (`info@rallygood.org.uk`) and charity registration details.

- `registrationStatus: "pending"` → every page shows **"Charity registration pending"**. The placeholder `charityNumber` (`1234567890`) is **never** written to the built site; the build fails if it leaks.
- When registration completes: set the real `charityNumber`, set `registrationStatus` to `"registered"`, review the wording noted in `OUTSTANDING.md`, push to `main`.

## Hosting setup (one-off)
1. Create a GitHub repo (e.g. `rallygood-website`), push this folder to `main`.
2. Repo → Settings → Pages → Source: **GitHub Actions**. Custom domain: `rallygood.org.uk`; tick **Enforce HTTPS** once the certificate is issued.
3. Cloudflare DNS for `rallygood.org.uk` (set the records to **DNS only / grey cloud** until GitHub has issued the certificate):
   - `A` `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` `www` → `<github-username>.github.io`
   - Recommended: verify the domain in GitHub (Settings → Pages → Add a domain) to prevent takeover.
   - Cloudflare: SSL/TLS mode **Full**; optionally redirect `www` → apex with a Redirect Rule.
4. Email (`info@rallygood.org.uk`): add MX records for whichever mailbox provider or Cloudflare Email Routing you use, plus SPF/DKIM/DMARC. The website only links to this address.

## Checks
`python3 scripts/check.py http://localhost:8099` (needs Playwright) checks status codes, console errors, internal links/anchors, mailto addresses, horizontal overflow at desktop and 390px, nav, filters, split calculator and form validation. Serve `dist/` first: `cd dist && python3 -m http.server 8099`.

## Contact form
GitHub Pages has no server, so the form opens the visitor's email app with a pre-filled message to `info@rallygood.org.uk`. To receive submissions without an email app, connect a form service (e.g. Cloudflare Worker, Formspree) and update the CSP in `src/layout.html`.
