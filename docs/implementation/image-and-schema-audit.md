# Image, metadata and structured-data audit (2026-10-17)

Basis: the built site from `main` at `ae928b1` (local build) and live checks in Chrome. Observed facts are separated from limits.

## On-site images (observed)
- Every `<img>` has `alt`, `width` and `height`. 38 empty alts are the header/footer logo beside the visible word "RallyGood" (decorative, correct). The other empty alts are shop-card thumbnails inside links that are `aria-hidden` with `tabindex="-1"`, next to a named text link. Product detail pages carry descriptive alt text, each starting "Sample illustration" or "Sample mock-up", which is honest because the products are mock-ups.
- Formats: PNG and JPEG, 45 to 75 KB each; social card PNG 1200 x 630, about 47 KB; logo, favicon, social-card source are SVG. No responsive `srcset`, WebP or AVIF. Optional, low value at these sizes.
- Loading: non-critical images lazy-loaded (home 4 of 6, shop 6 of 8). LCP is text on the pages measured, so no LCP image is lazy-loaded.
- Not checked: publication rights and privacy for the six shop images. They are illustrated mock-ups per `OUTSTANDING.md`; trustees must confirm artwork before the shop goes live. No photographs of people exist on the site.

## Search and social previews
- Every page has a canonical URL, Open Graph title/description/url/type/locale, `og:image` (absolute URL) with width, height and alt, and Twitter card tags (title, description, image, alt). Live home page confirmed `og:image:width` = 1200.
- All pages use the **same** social card. I did not create page-specific artwork. Platforms decide the final image and crop; previews were not checked on any real platform.
- No image sitemap. Not needed with so few images.

## Structured data
- Observed on live home page: one JSON-LD block containing `Organization`, `WebSite` and (on inner pages) `BreadcrumbList`, linked by `@id`. Organization has name, URL, logo URL (SVG), contact email and a description that says the charity is "in development". It deliberately omits charity number, legal name, address, `sameAs` and any registration claim.
- Validity: the JSON parses on every built page (checked with a script). **Not validated** with Schema.org's validator or Google's Rich Results Test; I could not run either. Schema.org validity is not the same as Google rich-result eligibility, and Organization markup does not by itself produce a rich result.
- Open question: Google's logo guidance may prefer a raster logo; I did not verify whether an SVG is accepted. Retest in Rich Results Test or Search Console after verification.
- Not used, deliberately: `Product`/`Offer` (shop is a preview, nothing on sale), ratings, reviews, `NGO`/charity-number properties, `FAQPage`, `Article`. Add them only when matching real, visible content exists.

## Actions
1. Run Rich Results Test and Schema.org validator on `/` and one inner page; record results here (owner or me with access).
2. When registered, add the real charity number to the visible site and consider adding it to the Organization markup (config-driven; it must come from the register, never the placeholder).
3. Commission page-specific social images if trustees want them; I will wire them in via the existing `image` front-matter option.
