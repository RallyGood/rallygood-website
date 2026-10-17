# SEO and content plan (2026-10-17)

**No keyword volumes, difficulty scores, rankings, competitor numbers or traffic forecasts are used.** None were available, and Search Console has no data yet. Everything below is a qualitative judgement from the site's actual pages. No page here may state a fact that is not yet true (no real Drops, partners or delivery evidence exist).

## 1. Technical state (observed)
- 12 indexable pages in the sitemap (no `lastmod`, deliberately); six shop product pages and the 404 are `noindex`. Every page has a unique title, a meta description, one H1 and a canonical URL. `robots.txt` allows all and points to the sitemap. JSON-LD (Organization, WebSite, BreadcrumbList) is live.
- Not verified: `http` to `https` and `www` to apex redirects, HTTPS enforcement setting, indexing status (no Search Console access yet).
- Descriptions: most are 105 to 186 characters. Home (186) and how-it-works (182) may be truncated in results; terms (42) and privacy (76) are very short. Low priority, easy copy edits.
- Thin or placeholder-like content (honest for pre-launch): `drops.html` (about 640 words, all illustrative), shop (preview). Strongest content: Nature & wellbeing (about 1,350 words), Home (about 900), How it works (about 570).

## 2. Content gaps
| Gap | Why it matters | Who can supply |
|---|---|---|
| No real Drop, partner or close-out report | The trust promise has no proof yet; search visibility for appeals cannot exist until they do | Trustees, after verification |
| No public address, trustee names or registration number | Needed for credibility and for Ad Grants website policy | Trustees (decision pending) |
| Nature & wellbeing: no session dates, locations or facilitators | Page promises a service with no booking path | Trustees, once confirmed |
| No complaints policy | Governance and trust page gap | Trustees |
| No news or updates page | Shows ongoing activity | Trustees; only when there is real news |

## 3. Page map (existing pages; proposals marked)
| URL | Intent / theme | Status | Conversion goal | Next action |
|---|---|---|---|---|
| `/` | Brand and what RallyGood is | Live | Updates sign-up, contact | Keep disclosures; shorten description |
| `/how-it-works.html` | How verified, proof-based giving will work | Live | Trust, then updates | Link to transparency |
| `/drops.html` | What a Drop is (illustrative) | Live | Updates | Keep "illustrative" labels |
| `/nature-wellbeing.html` | Local forest-bathing and wellbeing work | Live | Contact | Add dates and booking route when real |
| `/transparency.html` | Accountability | Live | Trust | Needs more inbound links |
| `/about.html` | Who we are | Live | Trust | Add trustees/address only if decided |
| `/get-involved.html` | Teams, sponsors, volunteers | Live | Contact | Link to how-it-works |
| `/shop.html` | Preview merchandise | Live, products noindex | Updates ("shop" topic) | Revisit at shop launch |
| Proposed: individual Drop pages | Appeal-specific | **Awaiting verified content** | Donation (when enabled) | Use the reusable structure below |
| Proposed: partner profiles, close-out reports | Proof | **Awaiting verified content** | Trust | Template only until real |
| Proposed: governance page | Registration, trustees, policies | **Awaiting trustee decisions** | Trust | Draft after decisions |

Reusable appeal structure: need and evidence; practical response; verified partner details (publishable only); what donations fund; delivery and verification approach; status and update date; donation action only when enabled; related appeals and trust links.

## 4. Internal links (from main page content only; nav and footer reach every page)
Observed: Home, About, Terms and Transparency receive **no** contextual links from other pages' content. Proposed additions (all to existing pages):

| From | To | Anchor text | Reason |
|---|---|---|---|
| How it works | Transparency | "how we will report on every Drop" | Proof promise is explained here, accountability page is the destination |
| About | Transparency, How it works, Safeguarding | "how we are accountable", "how a Drop works", "our safeguarding approach" | About currently links only to Nature & wellbeing |
| Drops | How it works, Transparency | "how verification works", "what we will publish" | Explains the illustrative cards |
| Get involved | How it works, Drops | "how a Drop works", "planned Drops" | Context for supporters |
| Nature & wellbeing | About | "about RallyGood" | Reciprocal link |
| Transparency | How it works | "the four-step process" | Reciprocal link |
| Terms | Contact | "contact us" | Dead end otherwise |

## 5. Ethical off-site opportunities (evidence-based, none bought)
- The Charity Commission register entry once registered (official, links to the website).
- Verified delivery partners' own sites and social accounts, only after a real Drop and with their agreement.
- Local nature and community directories once real sessions exist.
- Not warranted now: Google Business Profile (no public premises or service point), location pages, link buying, disavow files.

## 6. 90-day calendar (every item needs verified input first)
| Window | Work | Input needed |
|---|---|---|
| Days 1 to 14 | Add the internal links above; trim long descriptions; run Rich Results Test; verify Search Console; submit sitemap | Owner steps in `search-console-setup.md` |
| Days 15 to 45 | Governance page; complaints policy; publish nature session details if confirmed | Trustee decisions and documents |
| Days 46 to 75 | First real Drop page using the structure above; partner profile | Verified partner, costs, evidence route |
| Days 76 to 90 | Close-out report template page; review Search Console data and plan queries from real data | A live Drop; at least a month of data |

## 7. Monthly checklist
Search Console: indexing, queries, pages, Core Web Vitals, structured-data and image reports. Run `scripts/check.py` and `scripts/consent-test.py` after any change. Re-read disclosures (registration, donations, illustrative labels). Check broken links and the sitemap. Review GA4 key events and consent behaviour. Review Google for Nonprofits status (`google-for-nonprofits.md`).
