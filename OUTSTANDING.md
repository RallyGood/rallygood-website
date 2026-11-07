# Outstanding items (needs Raf)

## Access needed – blocked in this session
1. **GitHub repo – resolved:** `RallyGood/rallygood-website` exists and deploys to GitHub Pages on every push to `main`. (Branch pushes and PRs from this session work through the repo connection; the merge to `main` is done by Raf.)
2. **Cloudflare** – no access. Add the DNS records listed in `README.md` and set the custom domain in GitHub Pages. Confirm `rallygood.org.uk` is registered and on your Cloudflare account (outbound access to the domain is blocked from here, so I could not check it).
3. **info@rallygood.org.uk** – confirm the mailbox/forwarding exists (MX, SPF, DKIM, DMARC). Not verifiable from here.

## Decisions
4. **Split – resolved:** site now says 85% Drop / 15% operating (per Raf). The Financial Controls Policy wording ("85/2 Model") has a typo and should read 85/15. Check the registration package matches.
5. **Public identity details** – not published: trustee names, trustee/home addresses, principal office (2 Nineveh Gardens is listed as both the principal office and a trustee's address in your documents). Decide whether to show trustees and what public address to use (the Charity Commission register will publish the principal office).
6. **Registration status** – documents are dated 15 June 2026 but I can't tell whether the application was submitted. The site says only "Charity registration pending". When approved: set real number + `"registered"` in `config/site.config.json`, and review wording on About/FAQ/Transparency.
7. **Example Drops** – targets (£1,500–£7,500) and unit costs (£15–£75) are illustrative figures from the earlier draft. Confirm they are fine as examples, or replace them in `src/data/drops.json`.

## Missing information / content
8. No bank account, payment provider, or Gift Aid wording → no live donate button (deliberate). **Updated 5 Nov 2026:** brief revision 3.1 (approved by trustees) allows clearly labelled demonstration giving forms (banner "Demonstration only. No payment is taken.", button "Preview confirmation"). They store and send nothing. Real payments remain off.
9. No named delivery partner or real Drop yet.
10. No complaints policy in the registration package (site offers "Raise a concern" by email only).
11. No social media accounts, no photography, no team/trustee bios supplied.
12. Privacy notice and safeguarding page are summaries drafted from your policy documents – trustees should review before publishing. Privacy notice has no postal address (none approved for public use).
13. Contact form: now sends through Web3Forms (live test on 2026-10-18 delivered to the info@ inbox). Still to check: spam-folder placement, consent behaviour in the test log (`docs/templates/form-and-newsletter-test-plan.md`).
14. Security headers: GitHub Pages can't set custom HTTP headers (a CSP is set via meta tag). Optional: add headers via Cloudflare Transform Rules.

## Nature & wellbeing page (added)
- `/nature-wellbeing.html` is written from the constitution and charity-setup notes only. Not yet confirmed: session locations, dates, group sizes, facilitators, partners, risk assessments and facilitator checks. Trustees should review the forest-bathing background and the "research suggests" wording before launch.

## Contact form (Web3Forms) and newsletter (beehiiv)
- Contact form: DONE – Web3Forms key is set and a live test message arrived on 2026-10-18. The privacy notice names Web3Forms and says the email includes the sender's IP address and topic.
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

## Analytics, Search Console and templates (added 18 Oct 2026)
- GA4 (`G-WQH6PTFD4X`) loads only after the visitor accepts the cookie banner. Admin settings applied by Raf; first data seen. Open: mark `contact_form_submit` as a key event once it appears.
- Search Console: not yet set up (steps in `docs/implementation/search-console-setup.md`; needs a DNS TXT record in Cloudflare).
- Newsletter and cookie checks: not yet run live (`docs/templates/form-and-newsletter-test-plan.md`, section B).
- Unpublished drafts needing trustee input: `docs/templates/` (governance page, complaints policy, Drop and close-out templates, donation wording, partner due diligence). Decisions are listed in `docs/implementation/trustee-decision-brief.md`.
- Google for Nonprofits / Ad Grants: wait for charity registration (`docs/implementation/google-for-nonprofits.md`).
- Trustee decision brief: recommendations approved (reported by Raf 2026-10-18); next steps follow the order at the end of the brief.
- Drop tee artwork approved by trustees (reported by Raf 2026-10-18). Tees remain in preview. To go live: supply the approved final artwork files, replace the sample specs/costs, then set `detailsStatus` and `imagesStatus` to `confirmed` per product (see Shop section).

## Where we work and application consistency (added 7 Nov 2026)
- New page `/where-we-work.html`: one focus country per year (intended 2027 focus: Lebanon), a small responsive reserve for major emergencies, and the nine application countries shown as a pool to choose from, not a timetable. Wording matches the Charity Commission application (ref 5299401).
- **Needs trustee confirmation:** the 2027 focus (Lebanon) and the size of the emergency-response limit. No figure is published; set one and add it to the page if trustees want it stated.
- About and Transparency now say plainly that RallyGood is new, has no partner or bank account, and will not take donations before a bank account and controls are in place. Confirm this matches trustees' intentions.
- Nature & wellbeing now states "non-clinical: no diagnosis, counselling or medical treatment", matching the application.
- If the Commission narrows the overseas areas, update the list on `where-we-work.page` to match.


## Website brief 3.1 build (added 5 Nov 2026)
Built on branch `feat/allocation-explainer` as an unmerged pull request. Raf merges. Merging to `main` deploys to production.

**Release and dates**
- Islamic Giving release flag: `islamicGivingReleased` in `config/content.json`, currently `false`. Go-live date recorded there: **Monday 1 February 2027** (one week before Ramadan 2027), provisional, trustees to confirm. The date is not checked by the build or the browser. Release is a deliberate change by Raf: set the flag to `true` and push. **Set a calendar reminder.**
- Trustee decision still open: manual release by Raf, or an automated scheduled build-time check.
- Trustee decision still open: the Islamic Giving source sits in `src/islamic/` in this public repository. The flag hides the pages from the live site, but anything merged to `main` is readable on GitHub. Options: accept this, or keep the content on a private branch or repository until go-live.

**Zakat: open trustee decision.** Zakat is deliberately outside this build. There is no page, link, card, form, placeholder, navigation item, sitemap entry or public mention, and the build and CI fail if the word appears in built output. Do not add any until trustees decide.

**Other open decisions (do not invent):** final amount presets (the demo forms use sample amounts 5, 10, 25, 50); recurring-payment provider and cancellation workflow; accounting boundary between the 85% and the 15% so no cost is counted twice; allocation for Ramadan Rally; a suitable Sadaqah Jariyah project; Ramadan daily-giving and special-night rules; Ramadan Iftar Drop budget and delivery; campaign-restriction and surplus wording; final label for the 15p control (currently "Fundraising, operations and delivery support"); whether demo forms stay demonstrations at go-live; confirmation of the Get involved wording ("Support our running costs").

**Private preview:** see `docs/implementation/private-preview.md`. The preview is built from the PR branch with the flag forced on. It is noindex, not on the production domain, and can be removed without touching production. Cloudflare Pages and access restrictions need setting up by Raf (no Cloudflare access from the build environment).

**Mockup:** the generated allocation mockup is a layout and interaction reference only and should be attached to the pull request with that label. Its colours, icons, wordmark and text were not used.

**Approval trail:** see `docs/internal/islamic-giving-internal.md` for the internal record separating religious review, trustee approval, accounting review and technical implementation.
