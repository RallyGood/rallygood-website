# Private preview (Islamic Giving visible)

Production hides Islamic Giving until the go-live date. Reviewers need to see it first, so build a separate preview from the pull request branch with the release flag forced on.

## Build
```
PREVIEW=1 ISLAMIC_GIVING_RELEASED=true node scripts/build.mjs   # writes dist-preview/
PREVIEW=1 ISLAMIC_GIVING_RELEASED=true node scripts/ci-check.mjs
```
The override is ignored unless `PREVIEW=1` is also set, so a normal production build can never be flipped by an environment variable. A preview build:
- marks every page `noindex,nofollow` and shows a "Private preview. Not the live site." banner;
- writes `robots.txt` with `Disallow: /`, no sitemap, no `CNAME`, and no canonical links to the production domain.

## Hosting (Cloudflare Pages, to be set up by Raf)
1. Create a separate Cloudflare Pages project (not the production domain), for example `rallygood-preview`.
2. Build command `PREVIEW=1 ISLAMIC_GIVING_RELEASED=true node scripts/build.mjs`, output directory `dist-preview`, branch `feat/allocation-explainer`.
3. Restrict access with Cloudflare Access to the named reviewers only.
4. When review is finished, delete the Pages project. Production is unaffected.

## Checks run on both states
- Flag off (production): `node scripts/build.mjs && node scripts/ci-check.mjs`, then serve `dist/` and run `python3 scripts/check.py http://localhost:8099`.
- Flag on (preview): build as above, serve `dist-preview/` and run `ISLAMIC=1 python3 scripts/check.py http://localhost:8098`.
