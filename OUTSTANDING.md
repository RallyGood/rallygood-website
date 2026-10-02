# Outstanding items (needs Raf)

## Access needed – blocked in this session
1. **GitHub repo** – none exists, and this session has no valid GitHub login (`GH_TOKEN` invalid; sessions are limited to pre-configured repos). Create the repo (suggested name `rallygood-website`, public so free GitHub Pages works), push this folder to `main`, then Settings → Pages → Source: GitHub Actions.
2. **Cloudflare** – no access. Add the DNS records listed in `README.md` and set the custom domain in GitHub Pages. Confirm `rallygood.org.uk` is registered and on your Cloudflare account (outbound access to the domain is blocked from here, so I could not check it).
3. **info@rallygood.org.uk** – confirm the mailbox/forwarding exists (MX, SPF, DKIM, DMARC). Not verifiable from here.

## Decisions
4. **98/2 vs 85/15** – the site says 98% Drop / 2% operating (as in the project brief). Your *Financial Controls Policy* (registration package) says "85/2 Model … 85% project, 15% operating". Pick one and fix the policy or the site before launch. The site calls 98/2 "planned".
5. **Public identity details** – not published: trustee names, trustee/home addresses, principal office (2 Nineveh Gardens is listed as both the principal office and a trustee's address in your documents). Decide whether to show trustees and what public address to use (the Charity Commission register will publish the principal office).
6. **Registration status** – documents are dated 15 June 2026 but I can't tell whether the application was submitted. The site says only "Charity registration pending". When approved: set real number + `"registered"` in `config/site.config.json`, and review wording on About/FAQ/Transparency.
7. **Example Drops** – targets (£1,500–£7,500) and unit costs (£15–£75) are illustrative figures from the earlier draft. Confirm they are fine as examples, or replace them in `src/data/drops.json`.

## Missing information / content
8. No bank account, payment provider, or Gift Aid wording → no donate button (deliberate).
9. No named delivery partner or real Drop yet.
10. No complaints policy in the registration package (site offers "Raise a concern" by email only).
11. No social media accounts, no photography, no team/trustee bios supplied.
12. Privacy notice and safeguarding page are summaries drafted from your policy documents – trustees should review before publishing. Privacy notice has no postal address (none approved for public use).
13. Contact form opens the visitor's email app (static hosting has no server). For direct submissions, add a form service later.
14. Security headers: GitHub Pages can't set custom HTTP headers (a CSP is set via meta tag). Optional: add headers via Cloudflare Transform Rules.
