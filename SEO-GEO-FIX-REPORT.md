# GEO/SEO Fix Implementation Report

Scope: implement the P0/P1 fixes from the audit (project wiki `seo-audit/2026-07-04`,
report id `seo-audit/2026-07-03`) for the site served by this repo (share.makerhunter.com).
This repo is the generic BroadcastChannel template, so all fixes are driven by channel
data and environment variables rather than hardcoded values, and all UI copy stays in the
template's existing English so nothing is mislocalized.

## Fixes shipped

### P0 (blocking)

- P0-2 Meta governance: `<title>` no longer concatenates the raw channel blurb, and every
  description (meta, OpenGraph, RSS, JSON-LD) runs through a shared `cleanDescription()`
  that strips bare URLs, collapses whitespace and trims to 160 chars.
  - `src/lib/seo.js` (new), `src/layouts/base.astro`, `src/pages/rss.xml.js`
- P0-3 Semantic skeleton: added `<main>`, `<article id="post-{id}">`, `<time datetime>`,
  a single per-page `<h1>` (site title on list pages; visually hidden post title on detail
  pages), and `<nav>` landmarks with aria-labels.
  - `src/components/list.astro`, `src/components/item.astro`, `src/components/header.astro`,
    `src/layouts/base.astro`, `src/pages/posts/[id].astro`, `src/assets/global.css`
- P0-4 Structured data: JSON-LD injected on every page (WebSite + Person graph) plus
  SocialMediaPosting + BreadcrumbList on post detail pages. Built from channel data and
  social env vars, so `sameAs` and `inLanguage` stay correct per deployment.
  - `src/lib/seo.js`, `src/lib/social.js` (new), `src/layouts/base.astro`
- P0-5 robots.txt: converted from a static file to a dynamic endpoint so the `Sitemap:`
  directive is an absolute URL (sitemaps.org compliance).
  - removed `public/robots.txt`, added `src/pages/robots.txt.js`
- P0-1 Language: the layout already consumes the `LOCALE` env for `<html lang>` and schema
  `inLanguage`. Verified `LOCALE=zh-cn` yields `<html lang="zh-cn">`. See "Production env"
  below: production must set `LOCALE=zh-cn` for this to take effect (the template default
  stays `en` because the template targets an international audience by default).

### P1 (bundled, low risk)

- P1-1 Post pages now emit `og:type=article`, `article:published_time`, `article:author`,
  and `twitter:site`. `src/layouts/base.astro`
- P1-2 URL canonicalization: RSS `<link>`/`<guid>` no longer carry a trailing slash
  (`trailingSlash: false`), and middleware issues a 301 from `/path/` to `/path`.
  `src/pages/rss.xml.js`, `src/middleware.js`
- P1-3 `/before/*`, `/after/*`, `/search/*` now send `noindex, follow` and carry specific
  titles instead of reusing the homepage title.
  `src/pages/before/[cursor].astro`, `src/pages/after/[cursor].astro`,
  `src/pages/search/[q].astro`, `src/components/list.astro`, `src/layouts/base.astro`
- P1-4 RSS: channel description cleaned, every `<item>` guaranteed a `<title>`, and
  `atom:link rel="self"` added. `src/pages/rss.xml.js`
- Sitemap: homepage `/` added to the first (newest) shard exactly once.
  `src/pages/sitemap/[cursor].xml.js`

### Abstractions / knock-on cleanups (apply-broadly)

- Post title extraction (`src/lib/telegram/index.js`) had a latent bug: when a post starts
  with a URL the regex produced an empty title. Fixed at the source so both page titles and
  RSS item titles benefit.
- Removed the no-op `onclick=""` that was set on every in-content link; switched to
  `removeAttr('onclick')` so any inbound Telegram handler is stripped rather than blanked.
- Social profile URLs are now a single source of truth (`src/lib/social.js`) shared by the
  header icons and the JSON-LD `sameAs`, so the two cannot drift.

## Verification

Ran locally with `CHANNEL=MakerHunter LOCALE=zh-cn` against the live Telegram channel.

- `pnpm lint` clean; `SERVER_ADAPTER=node pnpm build` succeeds.
- `/` HTTP 200, `<html lang="zh-cn">`, `<title>MakerHunter</title>`, description
  has no bare URLs, `og:type=website`, 1 `<h1>`, 1 `<main>`, 20 `<article>`, 20 `<time datetime>`,
  valid WebSite+Person JSON-LD.
- `/posts/43` `og:type=article`, `article:published_time`/`article:author` present,
  canonical without trailing slash, 1 `<h1>`, valid SocialMediaPosting + BreadcrumbList JSON-LD.
- `/posts/43/` 301 -> `/posts/43`.
- `/before/23` `noindex, follow`, title `Older posts before #23 | MakerHunter`.
- `/search/result?q=temp` `noindex, follow`, title `Search: temp | MakerHunter`.
- `/robots.txt` absolute `Sitemap: <origin>/sitemap.xml`.
- `/sitemap.xml` + shards well-formed; homepage present only in the first shard.
- `/rss.xml` well-formed, cleaned channel description, `atom:link rel="self"`, every item
  has a title, item links have no trailing slash.

URLs to re-test after production deploy:

- https://share.makerhunter.com/ , /posts/43 , /posts/43/ (expect 301), /before/23 ,
  /search/result?q=temp , /robots.txt , /sitemap.xml , /sitemap/43.xml , /rss.xml
- Google Rich Results Test / Schema Markup Validator on `/` and `/posts/43`.

## Production env required (not code)

Set `LOCALE=zh-cn` in the production deployment env so `<html lang>` and schema `inLanguage`
are Chinese. Without it the code correctly falls back to `en` (the template default for an
international audience). No code change can substitute for this deployment setting.

## Decisions / deviations (need confirmation)

- Pre-commit lint: the repo already uses `simple-git-hooks` (dev dependency) with a
  `pre-commit -> pnpm lint-staged` hook. I activated it (the previous `postinstall` guard
  `test -d .git` silently skips inside git worktrees, so I changed it to
  `git rev-parse --git-dir` which works in both a normal clone and a worktree). I did NOT
  add husky: it would duplicate an existing, working mechanism, which the task explicitly
  warns against. The requirement (lint runs at pre-commit) is satisfied.
- robots.txt AI-crawler policy: the audit suggested optionally naming AI bots
  (GPTBot/ClaudeBot/PerplexityBot/Google-Extended) with explicit `Allow`. I left robots at
  `User-agent: * / Allow: /` because allow-vs-deny for AI training is a business decision
  the audit itself deferred to the owner. Say the word and I will add the explicit allowlist.
- /changelog: not added. These changes are SEO infrastructure with essentially no
  user-facing surface, and this repo is a generic upstream-tracked template with no existing
  changelog route or i18n copy pipeline for one. Adding a brand-new user-facing page is a
  product decision outside the audit scope. If you want an entry, a user-facing line would be:
  "Shared links and RSS now show cleaner titles and descriptions." Confirm and I will add it.

## Known remaining (from the audit, not in this PR)

- P1-5 / P2-5 per-post OpenGraph image (still the single channel avatar).
- P2-1..P2-3 aggregation pages (tools directory, about, tag pages).
- P2-4 `preconnect` to the media CDN.
- Content-side items (§14): channel blurb rewrite, monthly summaries, About copy.
