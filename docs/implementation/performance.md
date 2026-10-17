# Performance check (2026-10-17, after PR #2 deployed)

**Lab/single-sample only. No field data (CrUX) was available to me, so no claim is made that Core Web Vitals pass in the field.** The PageSpeed Insights API could not be fetched from this session (fetch error), so there are **no Lighthouse scores**.

## Method
Real Chrome (the owner's browser, desktop, wired to the live site), `PerformanceObserver` with buffered `largest-contentful-paint` and `layout-shift` entries, Navigation/Resource Timing, tab visible, analytics previously accepted in this profile (so the Google tag was loading). One sample per page, warm connection, probable HTTP cache hits. Not throttled.

| Page | TTFB | FCP | LCP | LCP element | CLS | Load event | Notes |
|---|---|---|---|---|---|---|---|
| `/` | 17 ms | 684 ms | 684 ms | H1 text | 0.003 | 749 ms | 9 requests; hosts: site, beehiiv, googletagmanager, region1.google-analytics |
| `/drops.html` | 140 ms | 732 ms | 732 ms | H1 text | 0.013 | 1201 ms | 8 requests, ~5 KB transferred |
| `/shop.html` | 138 ms | 492 ms | 492 ms | H1 text | 0.010 | 630 ms | 10 requests, ~241 KB transferred |

An earlier home-page sample read FCP/LCP 4272 ms. It was the first load in a newly opened tab; I believe the tab was in the background so painting was deferred (inference, visibility was not recorded then). Treat that figure as invalid. The re-run with `visibilityState: visible` is the one in the table.

## Observations
- LCP is H1 text on all three pages, so image format/preload is not an LCP problem. Images below the fold use `loading="lazy"` (home 4 of 6, shop 6 of 8) and every `<img>` has width and height, which is consistent with the low CLS.
- Transfer sizes for the home page read 0 (cached or cross-origin timing restricted), so no page-weight figure is claimed for it.
- The page makes requests to beehiiv, Google Tag Manager and `region1.google-analytics.com` in the accepted state. The Google hosts are only requested after consent (local tests: 30/30). The `region1.google-analytics.com` request shows analytics hits are being **sent from this browser**; it does not prove GA4 processed them.
- Shop product images are 45 to 75 KB PNG/JPEG, no WebP/AVIF/srcset. At these sizes, conversion is a low-value optional change.

## Not done
Lighthouse or PageSpeed (API unreachable), mobile emulation with CPU/network throttling, field data, multiple runs, INP (needs real interaction data; the interactive elements are the menu, Drops filter and forms, all light JavaScript).

## Retest
Run PageSpeed Insights manually for `/`, `/drops.html`, `/shop.html` (mobile and desktop) and save the results here. Re-check CrUX in Search Console (Core Web Vitals report) once the site has enough traffic for field data.
