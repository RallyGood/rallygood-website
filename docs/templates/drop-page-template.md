# Drop page template (not published)

Use only for a **real, verified** Drop. Every field below needs evidence on file before the page goes live. Illustrative Drops stay on `/drops.html` with their "illustrative" labelling.

## Pre-launch gate (all must be "yes")
| Check | Yes / No | Evidence reference |
|---|---|---|
| Charity registered and donations enabled on the site | | |
| Need verified by the named partner (date) | | |
| Partner passed due diligence (`partner-due-diligence-checklist.md`) | | |
| Costs verified (quote or price list) | | |
| Evidence route agreed (what, how, who, safety) | | |
| Safeguarding and photo-consent rules agreed with partner | | |
| Sanctions / legal checks done | | |
| Donation wording approved (`donation-wording-draft.md`) | | |
| Trustee approval minuted | | |

## Page content
**Title:** [Short, specific, e.g. "Winter blankets for [N] families"]
**Appeal ID:** [DROP-NNN]
**Status:** [Verifying / Live / Funded / Purchased / Delivered / Closed] · Last updated [DATE]

### The need
[What is needed, who for, where (country or region; exact location only if safe), and the source that verifies it. Link or name the source. No estimates presented as facts.]

### What we will fund
| Item | Unit cost | Quantity | Subtotal |
|---|---|---|---|
| [Item] | £[ ] | [ ] | £[ ] |
| **Drop fund target** | | | **£[ ]** |
Gross appeal target before the 15% operating support: **£[ ]** (target ÷ 0.85, rounded as stated in the donation wording). **[Check the arithmetic; show rounding.]**

### Delivery partner
[Name, what they do, how long they have worked in this area, and a link to their public presence. Only what they have agreed to publish.]

### How we will check delivery
[Receipts summary, partner sign-off, photos where safe and consented, timing.]

### Timeline
Target date to fund: [DATE]. Expected delivery window: [DATES]. Close-out report due: [DATE].

### If the target is missed or exceeded
[Use the approved wording from `donation-wording-draft.md`, verbatim.]

### Give
[Donation component. Only when enabled.]

### Updates
[Dated log, newest first. Delays and changes included.]

### Close-out
[Link to the close-out report once published. Until then: "Not yet closed".]

## Page requirements
- One H1, unique title and description, canonical URL; no keyword stuffing.
- Reuse the existing Drops card styling; do not invent images. Use only images with documented rights and consent.
- Add the page to the sitemap and the Drops archive table on `/transparency.html`.
- Analytics: use the dormant `appeal_view` / `donation_*` events in `docs/implementation/event-specification.csv` only after the payment provider and the privacy notice are updated.
