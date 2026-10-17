# Google for Nonprofits and Ad Grants readiness

Date checked: 2026-10-17. All sources are Google or ICO pages fetched this session. Pages said to be paraphrased; nothing here is legal advice or a guarantee of approval.

## Programme state (tracked separately)

| Stage | State |
|---|---|
| Technical/website readiness | Partly prepared locally (see table below) |
| Organisation eligibility | **Awaiting eligibility.** Charity registration is pending |
| Application and verification | Not submitted. No application should be made until registration completes |
| Programme approval | None |
| Product activation (Ad Grants, Workspace, YouTube, Maps) | None |
| Existing Google for Nonprofits account | **Unknown.** Nobody has confirmed whether one exists; do not create a duplicate |

## UK eligibility assessment

Source: [Eligibility guidelines - United Kingdom (Google Non-Profits Help)](https://support.google.com/nonprofits/answer/3215869?hl=en-GB&co=GENIE.CountryCode%3DGB), checked 2026-10-17.

- Observed: the page says an organisation must be registered as a charity under a listed UK route, verified by Google's validation partner, and agree to the Google for Nonprofits additional terms. Listed routes: Charity Commission (England and Wales), a Northern Ireland body, OSCR (Scotland), tax exemption with HMRC as a charity, exempt charities, and churches.
- Observed: the page does not mention CIOs by name and does not address pending applications.
- Observed discrepancy: the general FAQ at <https://images.google.co.uk/intl/en-GB/nonprofits/resources/faq/> names the validation partner as Percent, while the UK page names Goodstack. I treat the UK page as more specific. **Confirm the current partner in the application flow before relying on either.**
- Inference: RallyGood is being set up as a CIO registered with the Charity Commission, so the Charity Commission route is probably the relevant one after registration. This is **not verified**.
- Inference: because registration is required and pending applications are not addressed, "registration pending" should not be treated as eligible.
- Exclusions seen: government bodies, hospitals/healthcare, schools and universities (philanthropic arms may qualify), fiscally sponsored organisations (FAQ page).
- Not found: a documented accepted pre-registration route. I did not search beyond the two pages above.

**Exact blocker:** no Charity Commission registration number exists yet (the number in `config/site.config.json` is a placeholder and must never be used). **Evidence required:** the issued registration number and confirmation the entry is active on the register; named authorised representative; organisation-owned administrator email.

## Ad Grants website readiness

Source: [Website policy (Google Non-Profits Help)](https://support.google.com/nonprofits/answer/1657899), checked 2026-10-17. The page showed no last-updated date. Google says it may amend requirements at any time.

The program eligibility page (`support.google.com/grants/topic/3500092`) returned no usable content, so **Ad Grants programme-level eligibility rules are unverified.**

| Requirement (paraphrased) | Evidence in repo/live site | Result | Action | Owner | Retest |
|---|---|---|---|---|---|
| Organisation owns and controls the domain; site hosted on it, no redirect to a third-party | Domain `rallygood.org.uk`, GitHub Pages custom domain per README | Unverified (ownership/registrar control not seen) | Confirm registrar and Cloudflare account ownership are organisation-held | Raf | Owner screenshot or WHOIS |
| Substantial original content, no "under construction" placeholders | 12 indexable pages; Drops, partners, impact are explicitly illustrative; no partner or proof content yet | **Gap** (honest pre-launch state) | Do not invent content; add real content as it exists | Trustees | Content review |
| Clear mission and activities | Homepage, About, How it works, Nature & wellbeing pages | Pass (Claude's read of live homepage; no formal review) | None now | n/a | Re-read after changes |
| Physical address, registration number and/or annual report | None published; trustees' decision pending (`OUTSTANDING.md` 5) | **Gap** | Decide public address; add number only after real registration | Trustees | Page check |
| Working navigation and links | Local check script: links resolved, 20 checked | Pass locally | Re-run on live | Claude | `scripts/check.py` |
| Working donation links to a secure donation page | No donation page exists | Not applicable now; **gap if grants are applied for** | Do not add one until payments exist | Trustees | n/a |
| Fast, mobile-friendly | Responsive layout; no overflow at 390px locally | Lab-checked only; no field data, no PageSpeed run | Run PageSpeed Insights after deploy | Claude | PSI |
| HTTPS everywhere, no mixed content, HTTP redirects to HTTPS | Live page reached over HTTPS; HTTP redirect and Enforce HTTPS **not verified** | Unverified | Confirm in GitHub Pages settings | Raf | `curl -I` from an unrestricted machine |
| Limited mission-linked sales only; clear financial information | Shop is preview; transparency page present | Pass in preview; revisit at shop launch | Document trading position (see `OUTSTANDING.md`) | Trustees | Review at launch |
| No AdSense or excessive third-party ads | None found | Pass | None | n/a | grep |
| Beehiiv / third-party embeds | Newsletter iframe on pages | Not addressed by the policy text I read | Keep as is | n/a | n/a |

Overall: **not ready**, mainly for organisational reasons (registration, public address/number, real content), not coding reasons. No approval is promised.

## Conversion and campaign readiness

Not designed yet and should not be until Ad Grants eligibility is confirmed. Meaningful outcomes that **exist today**: successful contact-form submission and newsletter sign-up. Outcomes that **do not exist**: confirmed donations, regular-giving commitments. No GA4 property exists, so no GA4-to-Ads import is possible. Keep advertising features disabled.

## Other products (use case, state)

| Product | Use case | State |
|---|---|---|
| Google Workspace for Nonprofits | Team email/identity | Prepare later. README indicates Microsoft 365 email records exist, so do not change MX or migrate mail without a separate approved plan |
| YouTube Nonprofit Program | Video | Not applicable: no channel or content plan seen |
| Google Maps Platform credits | Maps | Not applicable: no operational use |
| Ad Grants | Search ads | Awaiting eligibility |

## Owner actions
1. Complete Charity Commission registration; record the real number only when issued.
2. Decide public address and whether to publish trustee names.
3. Confirm no Google for Nonprofits account already exists for RallyGood.
4. When eligible, submit the application yourself from an organisation-owned account (I will not submit it).
