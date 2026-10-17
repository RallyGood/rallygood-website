# Contact form and newsletter: manual live test plan

Why this exists: I could not submit the real contact form (it sends a real message) or complete the beehiiv sign-up (cross-origin iframe, third-party data), and local sandbox runs cannot reach Web3Forms or beehiiv. These are therefore **untested live**. Run once after any change to forms, CSP or consent. Tester: Raf. Use your own inbox.

Record the date, browser/device and result in the table. Mark "Pass" only if you saw it.

## A. Contact form (https://rallygood.org.uk/contact.html)
| # | Step | Expected | Result |
|---|---|---|---|
| A1 | Open the page in a private window; **do not** touch the cookie banner. Submit nothing yet | Banner shown; no Google requests (DevTools > Network, filter `google`) | |
| A2 | Choose Reject. Fill the form with a clearly marked test message ("TEST – ignore") and submit | Success message shown; no error | |
| A3 | Check the destination inbox | Test message arrives within a few minutes with the topic and your reply-to | |
| A4 | Check spam folder if not found | Note it. Fix deliverability if spam | |
| A5 | Repeat with Accept | Success; in GA4 Realtime, `contact_form_submit` appears with a `topic` parameter | |
| A6 | Submit with an empty required field | Browser or page validation blocks it; no send | |
| A7 | Submit the honeypot/spam field if present (skip if unsure) | Not delivered | |
| A8 | Try on a phone | Layout usable; success visible | |
| A9 | Block the form request in DevTools (offline) and submit | Page shows the "please email info@rallygood.org.uk" fallback | |

After A5, in GA4 Admin > Events mark `contact_form_submit` as a key event.

## B. Newsletter (beehiiv embed on the home page and contact page, per page)
| # | Step | Expected | Result |
|---|---|---|---|
| B1 | Open in a private window and look at the embed before choosing consent | Embed loads; note that beehiiv is a third party (disclosed in the privacy notice) | |
| B2 | Subscribe with a test address you control | Confirmation shown; beehiiv sends a confirmation email if double opt-in is on | |
| B3 | Confirm the subscription | The address appears in beehiiv's subscriber list | |
| B4 | Unsubscribe link works | Address removed | |
| B5 | In DevTools > Application > Cookies, note any beehiiv cookies set | Record names and lifetimes here; compare with the privacy notice wording ("may") and tighten the notice if needed | |

Newsletter sign-ups are **not measurable in GA4** (cross-origin iframe). Use beehiiv's own stats.

## C. Consent
| # | Step | Expected | Result |
|---|---|---|---|
| C1 | Private window, Accept; reload | Banner stays hidden; GA4 requests present | |
| C2 | Footer "Cookie preferences" > Reject | `_ga` cookies cleared; no more GA requests | |
| C3 | Check Realtime | No new events after rejecting | |

## Log
| Date | Tester | Browser/device | Sections run | Issues found | Follow-up |
|---|---|---|---|---|---|
