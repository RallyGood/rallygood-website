# Trustee decision brief (2026-10-18)

Purpose: every open decision I found that blocks launch, with options and a recommendation. Recommendations are mine and are for trustees to accept or change. This is not legal or financial advice; items marked **[advice]** should be checked with a solicitor, accountant or the regulator's current guidance, none of which I have re-read for this brief.

Already decided (for the record): public split 85/15 (Raf, 2026-10-18; the older 98/2 figure was a mistake and the Financial Controls Policy's "85/2" is a typo, per `OUTSTANDING.md`); consent before any analytics; `donation_received` event kept separate from merchandise `purchase`; privacy wording reviewed by trustees (note PR #6 added IP address and topic, which trustees have not yet reviewed if it merged after their review).

## A. Needed before any donation is taken
| # | Decision | Options | Recommendation | Blocks |
|---|---|---|---|---|
| A1 | Charity registration status and number | Wait for the Commission's decision; do not publish anything implying registered status | Keep "pending" wording until the register shows the entry; then set the number in `config/site.config.json` | Everything below, Google for Nonprofits, shop |
| A2 | Payment provider | Fundraising platform or payment processor; compare fees, Gift Aid support, payout speed, restricted-fund reporting, refund tools | Choose one that supports recurring giving, Gift Aid and clean reconciliation exports; avoid anything that cannot export per-appeal totals | Donate button, GA4 donation events |
| A3 | Are payment fees inside or on top of the 15%? | Inside (simplest message, 15% must cover them); on top (gift grossed up) | Inside, stated plainly; check the 15% covers processing, verification, safeguarding and reporting at expected volumes | Donation wording |
| A4 | Surplus rule for an over-funded Drop | Next similar appeal (current site wording); named reserve; ask donors | Keep the current wording and state it at the point of giving; define "similar" **[advice]** | Donation wording, legal check |
| A5 | Shortfall and cancellation rules | Fund fewer units; extend; offer refund or reallocation | Keep current wording, add who decides and by when | Drop template |
| A6 | Refund window | e.g. 14 days unless funds already sent to the partner; none | Short window, stated clearly; confirm the provider supports it | Donation wording |
| A7 | Gift Aid | Apply to HMRC for charity recognition once registered; decide who submits claims | Do not show any Gift Aid prompt until HMRC recognition is in place **[advice]**; use HMRC's model declaration text verbatim | Donation flow |
| A8 | Bank account and controls | Dual authorisation; ring-fenced Drop accounting; reconciliation cadence | Dual approval for payments to partners; per-Drop ledger; monthly reconciliation reviewed by a second trustee | First Drop |
| A9 | Legal review of donor-facing terms | Solicitor review; regulator guidance only | At least a light-touch solicitor review of `docs/templates/donation-wording-draft.md` **[advice]** | Launch |

## B. Needed before the first real Drop
| # | Decision | Options | Recommendation | Blocks |
|---|---|---|---|---|
| B1 | First partner | Name a candidate and run `docs/templates/partner-due-diligence-checklist.md` | One partner, lower-complexity need (hygiene, warmth or food), not an active conflict zone, per the strategy notes | First Drop |
| B2 | Risk appetite | Maximum exposure per Drop; tranche pattern | Set a cap (e.g. a few thousand pounds for the first Drop) and tranche against evidence | Partner agreement |
| B3 | Evidence and photo policy | What evidence is mandatory; when photos are allowed; consent wording | Receipts and partner sign-off mandatory; photos only if safe and consented | Partner agreement, close-out |
| B4 | Sanctions and legal screening process | Who screens, which lists, record keeping | Named trustee owns it; screening record kept per partner **[advice]** | First Drop |
| B5 | Complaints policy | Adopt `docs/templates/complaints-policy-draft.md` after edit | Adopt before launch; set realistic timescales | Governance page |
| B6 | Example Drops on the site | Keep as illustrative; replace with real once verified | Keep labelled "illustrative" until a real Drop exists | None |

## C. Public identity
| # | Decision | Options | Recommendation |
|---|---|---|---|
| C1 | Name trustees publicly? | Names and short bios; names only; none until required by the register | Publish names with consent (the register will make them public anyway); mention their roles |
| C2 | Public address | A business or virtual office address; a trustee's home address; none yet | Avoid publishing a home address. Decide on a postal address that the register and privacy notice can use (`OUTSTANDING.md` item 5 notes an address clash in the documents) |
| C3 | Accounts and reports | Publish a first summary after year end | State plainly that no accounts exist yet; do not imply independent examination |

## D. Merchandise (shop)
| # | Decision | Recommendation |
|---|---|---|
| D1 | Country Drop tees (Lebanon, Palestine) | Trustees must approve artwork and wording; no such Drop or approved design exists. Consider removing them from preview until a real Drop exists, to avoid implying one |
| D2 | Trading position and VAT | Accountant to confirm small-trading and VAT treatment **[advice]** |
| D3 | Shop income vs the 85/15 split | Treat as separate and say so; confirm accounting |
| D4 | Supplier, returns, delivery | Replace placeholder figures with the real supplier's terms |
| D5 | Merchant Center | Only after real products, policies and checkout exist (`merchant-eligibility.md`) |

## E. Website and data
| # | Decision | Recommendation |
|---|---|---|
| E1 | Review PR #6 privacy addition | Trustees to read it (IP address, topic) |
| E2 | Newsletter provider terms and cookie behaviour | Complete beehiiv settings; run the cookie test; tighten the notice if beehiiv sets cookies |
| E3 | Data-processing terms for Web3Forms, beehiiv, GA4 | Accept and file them; note in the privacy notice if a transfer outside the UK applies **[advice]** |
| E4 | Nature and wellbeing programme | Confirm locations, facilitators, risk assessments before the page promises sessions |
| E5 | Who owns the Google, Cloudflare, GitHub and beehiiv accounts | At least two trustees with access; record owners and recovery details privately (not in the repo) |

## Suggested order
1. Registration (A1), then Gift Aid recognition (A7).
2. Payment provider and bank controls (A2, A8), fees and refund rules (A3, A6) and legal review (A9).
3. Complaints policy and public identity (B5, C1, C2).
4. Partner shortlist, due diligence and risk cap (B1 to B4).
5. Only then publish a real Drop.
