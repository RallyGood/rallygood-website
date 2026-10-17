# Reporting specification (Looker Studio)

**This is a build-ready specification. No dashboard exists and nothing is connected.** A specification is not a connected dashboard. Building it needs a RallyGood-owned Google account with access to the GA4 property (`G-WQH6PTFD4X`) and, once verified, Search Console.

## Sources and disclosures
| Source | State | Notes |
|---|---|---|
| GA4 (Looker Studio connector) | Property exists; data only from visitors who accept analytics | Free connector; processing delay of hours; thresholds and sampling may apply; owner of the report controls who sees it |
| Search Console | Not verified yet (`search-console-setup.md`) | Clicks and impressions are not comparable to GA4 sessions |
| Payment data | No provider | Section 2 stays empty |
| Merchant Center, Ad Grants | Not applicable now | Sections 6 and 7 omitted until real |

Expected under-count: GA4 only sees consented visitors, so totals are a lower bound and the consent rate is unknown until measured. Do not present GA4 numbers as total visits.

## Pages (build order)
1. **Overview.** GA4 users, sessions, engaged sessions, `contact_form_submit` key-event count, `launch_updates_click` count; Search Console clicks and impressions side by side but labelled separately; data-freshness note.
2. **Acquisition.** Sessions and engaged sessions by default channel group and by `utm_campaign` (convention in `measurement-and-consent.md`); top landing pages. No internal-link UTMs.
3. **Organic search.** Clicks, impressions, CTR, average position by page, query, device and country. Branded vs non-branded as an approximation, with the caveat that anonymised queries are omitted.
4. **Supporter actions.** Contact submissions by `topic`; updates-link clicks by `source_page`. Newsletter sign-ups are **not measurable** today (cross-origin iframe).
5. **Data quality.** Consent rate cannot be computed from GA4 alone; instead track pages with zero events, `(not set)` landing pages and date of last data. Add banner accept/reject counts only if a privacy-reviewed event is added later.
6. **Appeals and donation funnel.** Dormant until a payment provider exists. Metrics and sources are defined in `event-specification.csv`. Financial totals must come from the payment provider, kept separate from GA4-observed outcomes, and commitments separate from payments received.

## Metric definitions (current)
| Metric | Source | Formula | Grain | Timezone | Limits |
|---|---|---|---|---|---|
| Users, sessions, engaged sessions | GA4 | GA4 standard | day, page, channel | Property time zone (confirm UK) | Consented visitors only |
| Contact submissions | GA4 `contact_form_submit` | event count, key event once marked | day, topic | as above | Counts successes from Web3Forms response; not tested against the real service |
| Updates link clicks | GA4 `launch_updates_click` | event count | day, source_page | as above | Clicks, not sign-ups |
| Clicks, impressions, CTR, position | Search Console | as provided | day, page, query | Pacific/UTC per Google | Different population from GA4 |

Do not join GA4 and Search Console at user or session level; compare trends only. Do not put donor-level or personal data in any shared report.

## Maintenance
Owner reviews monthly with the checklist in `seo-and-content-plan.md`; remove or hide sections that show no data rather than leaving empty charts.
