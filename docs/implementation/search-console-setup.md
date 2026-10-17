# Search Console setup (owner steps)

**Status: Awaiting owner action. Nothing in Search Console has been created, verified or submitted.**

**Source caveat:** I could not fetch Google's help pages this session (the fetch permission request went unanswered), so these steps come from general knowledge and are **not checked against current Google documentation**. Check them against Google's own help pages for "Verify your site ownership" (DNS record method) and "Build and submit a sitemap" in Search Console Help before relying on them.

## 1. Add a Domain property
1. Sign in to Search Console with a RallyGood-owned Google account (the same one that owns the GA4 property is simplest).
2. Add property, choose **Domain**, enter `rallygood.org.uk`.
3. Google shows a TXT record starting `google-site-verification=`. Do not share it publicly beyond the DNS record itself.

## 2. Add the TXT record in Cloudflare (needs your approval; I have not touched DNS)
- Cloudflare dashboard for the RallyGood account, zone `rallygood.org.uk`, DNS > Add record: Type TXT, Name `@`, Content = the value Google gave.
- Do not delete or edit the existing records (GitHub Pages A/AAAA/www records and the Microsoft 365 email records listed in `README.md`). Email and the site depend on them.
- Return to Search Console and press Verify. DNS can take time to propagate.

## 3. Submit the sitemap
- Sitemaps > add `https://rallygood.org.uk/sitemap.xml`. It lists 12 URLs (the six shop product pages and the 404 page are deliberately excluded or `noindex`).
- A submitted sitemap helps discovery. It does not guarantee indexing or rankings.

## 4. Inspect representative URLs
URL Inspection on `/`, `/drops.html`, `/about.html`, `/privacy.html`. Record the result here (indexed/not indexed, canonical Google chose, detected structured data). I cannot do this without access.

## 5. Link to GA4
GA4 Admin > Product links > Search Console links, choose the verified property and the web stream `RallyGood`. Needs owner access to both.

## 6. What to expect and monitor (monthly)
Clicks, impressions, CTR and average position by page, query, device and country; indexing report; Core Web Vitals (field data may be absent for a small site); structured data and image reports. Branded and non-branded splits are approximate. No ranking or traffic promise is made.

## Retest
After verification, confirm the property shows as verified, the sitemap shows "Success" with 12 discovered URLs, and the four inspections are recorded.
