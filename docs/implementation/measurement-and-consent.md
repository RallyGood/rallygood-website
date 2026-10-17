# Measurement and consent plan (design only, nothing live)

Date: 2026-10-17. **Status: consent-gated GA4 loader implemented on branch `claude/implementation-checkpoint` and tested locally against stubbed Google endpoints. Not merged, not deployed, not verified against a live GA4 property. No payment provider exists.** Not legal advice.

## Business questions
Where do supporters discover RallyGood? Which pages and campaigns bring people who sign up for updates or contact us? How do mobile and desktop compare? Once donations exist: which appeals lead to completed donations, where do journeys drop, and how do analytics outcomes compare with payment records. Association is not causation.

## Current facts affecting design
- Observed: no Google tag; CSP `script-src 'self'` (inline scripts blocked, `www.googletagmanager.com` not allowed); privacy notice describes no site-side analytics.
- Observed: only genuine supporter actions today are the contact form (Web3Forms, cross-origin fetch) and the newsletter (beehiiv iframe, cross-origin, so success is not visible to page scripts without beehiiv support).

## Decisions recorded (Raf, 2026-10-17)
1. Consent comes before any optional measurement.
2. Donations use a custom `donation_received` event; `purchase` is reserved for genuine merchandise.
3. GA4 property to be created by the owner (see `plan-and-status.md`); no ID exists yet.

## Consent approach
Source: ICO, [What are the exceptions?](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/) (page dated 29 April 2026, checked 2026-10-17).

- ICO says the statistical-purposes exception applies only if the technology is used solely to measure service use for improvement, outputs aggregate non-identifying statistics, makes no decisions about individuals, gives clear information and a simple free way to object, and shares data only with a processor that does not combine it with other data.
- It lists linking visitors to advertising or conversions, and profiling by demographics, as outside the exception.
- Inference: a default Google Analytics 4 setup with Google signals, ads links, or conversion import would not fit that exception, so **consent should be obtained before loading it**. Whether any narrower GA4 configuration fits the exception is a legal judgement I have not made.
- Recommended default: no optional measurement before an explicit choice; accept and reject equally prominent; nothing pre-selected; persistent "cookie preferences" link; withdrawal stops measurement; consent stored in first-party storage with a defined expiry.
- Consent Mode: basic mode loads no Google tag until consent (recommended, matches the default). Advanced mode loads the tag first and sends cookieless pings before consent; I do not recommend it for a charity site without a documented legal basis. Set all four signals (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) to denied by default before any command.
- Keep disabled: Google signals, ads personalisation, enhanced conversions, remarketing audiences.
- Architecture: direct Google tag, not GTM (single static site, few events). One page-view strategy; the site is multi-page, so no SPA handling needed. Requires a CSP change and a privacy-notice update, both of which need approval.
- Not chosen yet: whether to use a bespoke banner or a consent platform. I will not add one without approval.

## Donation measurement (dormant until payments exist)
- The payment provider is the financial source of truth; GA4 is not the ledger. No provider is chosen.
- Confirmed donations must come from verified provider webhooks, never from a success URL. Use an opaque transaction reference as the dedup key, because GA4 does not deduplicate arbitrary custom events.
- Never send names, emails, addresses, Gift Aid declarations or free text to GA4. Do not put personal data in URLs, titles or form-error text.
- Recommendation: use a custom `donation_received` event for donations and reserve `purchase` for genuine merchandise, so reports do not mix them. Alternative: use `purchase` for both with an `item_category` split. Decision needs trustee input; both have report-semantics trade-offs I have not tested.
- Separate one-off payments, new recurring commitment, first payment, later payments, failures, refunds. A commitment is never counted as revenue.
- Expect GA4 to under-count versus the provider (consent refusals, blockers, delayed webhooks, thresholds).

## UTM convention
`utm_source` (platform/partner, lowercase), `utm_medium` (`email`, `social`, `partner`, `qr`, `referral`), `utm_campaign` (`<yyyy-mm>_<appeal-id>`), optional `utm_content`. No internal-link UTMs. No personal data in parameters. Appeal IDs are stable lowercase slugs (existing example IDs: `example-warmth`, etc.), separate from editable titles.

## Event specification
See `event-specification.csv`. Every row is **not implemented**.

## Activation prerequisites
1. Trustee decision on consent approach and privacy-notice wording.
2. RallyGood-owned GA4 property and measurement ID (owner creates; I do not request or assume an ID).
3. Approved CSP change; consent banner built and tested across the consent matrix (before, accept, reject, withdraw, return visit).
4. Payment provider chosen; sandbox webhooks tested before any donation event is enabled.

## Implementation on the branch (2026-10-17)
- Measurement ID `G-WQH6PTFD4X` (supplied by Raf; public by design) is in `config/site.config.json` as `ga4MeasurementId`. Leaving it empty removes the tag, banner and preferences link entirely.
- `src/consent.js`: basic-style consent. Nothing from Google loads before an Accept. It queues a consent default of denied for `analytics_storage`, `ad_storage`, `ad_user_data` and `ad_personalization` (local only, no request). On Accept it grants only `analytics_storage`, loads gtag.js and sends config with Google signals and ad personalisation off. Reject and Withdraw set the `ga-disable` flag, deny storage and delete `_ga*` cookies.
- Banner: equal Reject and Accept buttons, nothing pre-selected, no focus theft on first load, Escape closes it only once a choice exists. Footer "Cookie preferences" reopens it and shows the current choice. Choice stored in localStorage key `rg_consent_v1` for up to 180 days (my choice of period; adjust if trustees prefer).
- Events sent after consent: `page_view` (via config), `contact_form_submit` (only on a successful Web3Forms response), `launch_updates_click`. Others in the spec stay unimplemented.
- CSP widened only when an ID is set, using Google's documented hosts without the Ads endpoints (source: [Google tag CSP guide](https://developers.google.com/tag-platform/security/guides/csp), checked 2026-10-17). `connect-src` includes `https://*.google.com` as that guide lists; this is broader than I like and can be narrowed after testing against a live stream.
- Privacy notice text now describes the analytics choice. Trustees must review it before merge.

## Owner actions inside Google Analytics (not done, not verified by me)
1. Confirm time zone United Kingdom and currency GBP on the property.
2. Confirm Google signals is off; do not enable ads personalisation or link Google Ads yet.
3. Set data retention (event data) to the shortest period you are comfortable with; the default may be short already, check it.
4. Enhanced measurement: review each toggle. I recommend leaving page views on and switching off form interactions and site search, since the site has no internal search and the contact form should not be auto-tracked. This is a recommendation, not verified behaviour.
5. After the branch is deployed and you accept analytics once, check Realtime/DebugView, then mark `contact_form_submit` as a key event once it has appeared.
6. Filter or exclude internal/developer traffic.

## Test evidence
`python3 scripts/consent-test.py` (Playwright, Google hosts intercepted and stubbed, so no data reached Google): 30/30 passed. Covers before choice, reject, accept, returning visitor, withdrawal (including cookie clearing and focus), expired choice, keyboard operation and the privacy-page text. **Not tested:** real delivery to GA4, real `_ga` cookie names set by Google, Safari/Firefox, screen readers.
