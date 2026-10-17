# Outstanding items (needs Raf)

## Access needed – blocked in this session
1. **GitHub repo** – none exists, and this session has no valid GitHub login (`GH_TOKEN` invalid; sessions are limited to pre-configured repos). Create the repo (suggested name `rallygood-website`, public so free GitHub Pages works), push this folder to `main`, then Settings → Pages → Source: GitHub Actions.
2. **Cloudflare** – no access. Add the DNS records listed in `README.md` and set the custom domain in GitHub Pages. Confirm `rallygood.org.uk` is registered and on your Cloudflare account (outbound access to the domain is blocked from here, so I could not check it).
3. **info@rallygood.org.uk** – confirm the mailbox/forwarding exists (MX, SPF, DKIM, DMARC). Not verifiable from here.

## Decisions
4. **Split – resolved:** site now says 85% Drop / 15% operating (per Raf). The Financial Controls Policy wording ("85/2 Model") has a typo and should read 85/15. Check the registration package matches.
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

## Nature & wellbeing page (added)
- `/nature-wellbeing.html` is written from the constitution and charity-setup notes only. Not yet confirmed: session locations, dates, group sizes, facilitators, partners, risk assessments and facilitator checks. Trustees should review the forest-bathing background and the "research suggests" wording before launch.

## Contact form (Web3Forms) and newsletter (beehiiv) – decided, needs your keys
- Contact form: create a Web3Forms access key for info@rallygood.org.uk (web3forms.com, key is emailed), paste it into `web3formsAccessKey` in `config/site.config.json`, push.
- Newsletter: DONE – beehiiv publication "RallyGood" and subscribe form created; embed URL set in config. Remaining in beehiiv: postal address in email footer settings, welcome email, sender name/reply-to, check free-plan limits after the Pro trial.
- Until both are set the site falls back to mailto and the privacy notice says so; once set it names Web3Forms and beehiiv automatically.
- Then: accept each provider's data-processing terms, and have trustees review the privacy notice.

## Shop (added 17 Oct 2026) – built, in preview, ready to go live
Everything is generated from `config/shop.json` (products, prices, costs, specs, policies, images). Page layout is in `scripts/shop.mjs`. `site.config.json` → `shopStatus` is `"preview"`.

**Preview state (now):** `/shop.html` (3 groups: Core range, Drop editions, £10 and under), six product pages under `/shop/`, and a 3-card block on the homepage. The **Buy merchandise** button is on every product page but disabled ("opens after registration"). Product pages are `noindex` while in preview. Photos are illustrated mock-ups; sizes, materials, costs and delivery are **sample figures** (costs come from the research file's planning assumptions).

**To go live** (the build refuses to publish the shop live until all of these are true):
1. `registrationStatus` is `"registered"` with the real charity number.
2. For each product in `config/shop.json`: replace the sample text/numbers (specs, costs, made/dispatch, funding wording) and images (drop files in `src/assets/shop/`, update `image`/`alt`), then set `detailsStatus` and `imagesStatus` to `"confirmed"`.
3. Give each product an https `checkoutUrl` (e.g. a payment link from whichever provider is chosen). No payment provider is chosen yet.
4. Set `shopStatus` to `"live"` and push. Sample banners, "Coming soon" labels and "provisional" wording disappear automatically.

**Decisions for trustees before launch**
- Lebanon and Palestine Drop tees: sample designs from Raf's mock-ups. No such Drop, partner or approved design exists. Trustees should review the artwork (cedar, olive sprig, flag-like colourways) and the wording "RallyGood's purpose is the relief of people in need; this item is not a statement on any political issue" for charity-law neutrality. The amount going to each Drop is "to be confirmed" and must be set (and a Drop actually opened) before sale.
- Written trading position (HMRC non-primary-purpose trading; confirm small-trading exemption with accountant), VAT treatment, commercial-participator agreement if any artist is involved.
- Delivery (£3.95, free over £60), returns wording and dispatch times are placeholders; confirm with the real supplier and policy. Add a complaints/returns policy page if wanted.
- Shop income is treated separately from the 85/15 Drop split; confirm how it is accounted for.
- Privacy notice: update if the chosen payment/fulfilment providers process customer data.
- The generic "Limited Drop T-shirt" concept was replaced by the two country Drop tees.
