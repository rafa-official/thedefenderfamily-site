# The Defender Family — Site Operations

Verified against the repo on 2026-09-28. Everything below was checked in this repository. Items marked **Confirm** are things only the site owner can verify (accounts, hosting, renewals) and are collected at the end.

## 1. Project basics

- **Location:** `/Users/rafalanus/Documents/tdf-site` (older notes say `~/Downloads/tdf-site` — that path is stale).
- **Generator:** Eleventy **2.0.1** (`@11ty/eleventy` `^2.0.1`), plus `@11ty/eleventy-img` `^6.0.4`.
- **Node:** v25.9.0 on this machine (no `engines` field or `.nvmrc` pins a version).
- **Templates:** Nunjucks (`.njk`) and Markdown (`.md`, processed with Nunjucks).
- **Input / output:** `src/` → `_site/` (`_site/` and `node_modules/` are git-ignored).
- **Git remote:** `origin` → `https://github.com/rafa-official/thedefenderfamily-site.git`, branch `main`.

## 2. Commands

| Task | Command |
|---|---|
| Build | `npm run build` (runs `npx @11ty/eleventy`) |
| Preview with auto-reload | `npm start` (runs `npx @11ty/eleventy --serve`); add `-- --port 8082` for a fixed port |

## 3. Repo layout

- `src/*.njk` — English pages (index, about, contact, projects, press, work-with-us, sophie-on-board, thank-you, 404, defender-trophy-concept, rafa-lanus, stories, story-tags, sitemap, robots).
- `src/es/*.njk` — Spanish pages (index, sobre-nosotros, contacto, gracias, historias, proyectos, rafa-lanus, sophie-a-bordo, trabajemos-juntos).
- `src/stories/*.md` — story articles (see section 4).
- `src/_includes/layouts/` — `base.njk`, `article.njk`, `project.njk`.
- `src/_includes/partials/` — one file: `hreflang.njk`.
- `src/_data/site.json` — site name, URL, default meta, social links, author.
- `src/css/style.css`, `src/images/uploads/` — assets, passed through to `_site/`.
- `src/.htaccess`, `src/_redirects` — passed through to `_site/`.
- `.eleventy.js` — config: `image` shortcode (WebP + JPEG at 400/800/1200 px into `_site/img/`), collections (`stories`, `storiesByTag`, `projects`), filters, passthrough copies.

## 4. Stories

There are **4** stories in `src/stories/`:

1. `our-defender-from-family-car-to-overland-home-.md` (note the trailing hyphen in the filename)
2. `the-man-at-the-gas-station.md`
3. `where-is-padme.md`
4. `you-ve-been-selected.md`

Front matter used by all four:

```yaml
layout: layouts/article.njk
title: "..."
subtitle: "..."
date: 2026-04-20
category: The Defender
author: Rafa Lanús
authorUrl: /rafa-lanus/
heroImage: /images/uploads/....jpg
ogImage: /images/uploads/....jpg
ogImageAlt: "..."
ogType: article
description: "..."
tags: stories
```

Notes on fields and values:

- Nothing in the code validates values; the layout just prints what it is given.
- All four stories use `tags: stories`. The `stories` collection itself is built from the `src/stories/*.md` glob, not from tags. The `stories` tag is excluded from tag pages and related-post matching; any other tag creates a page at `/stories/tag/<slug>/` and drives "related stories".
- `category` values in use: `Expedition`, `The Defender`, `The Road Life`. (The old cheat sheet also lists `Gear & Kit` and `Impact Stories`; no story uses them.)
- `draft: true` removes a story from the `stories` collection and from the sitemap. No story currently sets `draft`.
- `heroImage` should be a `.jpg`; `article.njk` derives a `.webp` sibling by string replacement, so the `.webp` file must exist next to it.
- `heroImageAlt` is read by the layout but no story currently sets it.
- Stories are sorted newest first by `date`.
- The old cheat sheet says new articles go in `src/expeditions/`. That folder does not exist; use `src/stories/`.

## 5. SEO and structured data

- **Article JSON-LD:** does **not** exist in `article.njk`. JSON-LD is present only in `project.njk` (`CreativeWork`) and `work-with-us.njk` (`FAQPage`).
- **Hreflang:** `partials/hreflang.njk` emits alternate links only when a page's front matter has `translations`. The Stories page (`src/stories.njk`) no longer has `translations` (removed 2026-09-28, commit `9438ba6`), because `/historias/` is a placeholder and not an equivalent page. `src/es/historias.njk` still lists `/stories/` as its English alternate, so that link is one-way.
- **Staging noindex:** an inline script in `base.njk` sets `noindex, nofollow` on any hostname other than `thedefenderfamily.com`.
- **Sitemap / robots:** generated from `src/sitemap.njk` and `src/robots.njk`; pages opt out with `sitemap: false` or `draft: true`.

## 6. Server files

- **`.htaccess`** (`src/.htaccess`) contains one line: `ErrorDocument 404 /404.html`. It has no redirects and no HTTPS or www rules.
- **`_redirects`** (`src/_redirects`) is entirely commented out. It is a Netlify-style file and has no effect on Apache/SiteGround hosting.

## 7. Media in git

- **Tracked in git, in `src/images/uploads/`:** `hero-desktop.mp4` (22 MB), `hero-mobile.mp4` (7.2 MB), `Trophy VR.mp4` (3.7 MB), `the-defender-family-open-graph.jpg` (default OG image) and `the-defender-family-front-runner-chairs.jpg` (story-card fallback).
- `hero-desktop.mp4`, the OG image and the chairs image were untracked until 2026-09-28, when they were copied from `_site/` into `src/` and committed. A fresh clone plus build now recreates them.
- GitHub rejects files over 100 MB and warns above 50 MB. The largest video is 22 MB, so there is room, but a new hero video near 50 MB would need Git LFS or hosting elsewhere.

## 8. Deployment

Deployment is manual and separate from git: build, then upload `_site/` to the host with Transmit.

1. Stop the preview server (Ctrl+C).
2. `npm run build`.
3. In Transmit, connect to the site bookmark. Local: `/Users/rafalanus/Documents/tdf-site/_site`. Remote: `public_html`.
4. Use Transfer → Synchronize, direction Local → Remote, and review the list before confirming.
5. Check the live site.

> **WARNING — Mirror deletes remote files.** Transmit's Mirror mode deletes any remote file that is not present in `_site/`. Before the next deploy, check `public_html/` and make sure none of these will be deleted:
>
> - `.htaccess` (confirm the live copy has no host-added rules beyond `src/.htaccess`)
> - `.well-known/` (SSL and domain validation; not in this repo)
> - any subdomain folders (for example a `draft` folder)
> - any files uploaded by hand that are not in `_site/` (the three media files that used to be in this category are now in `src/`, but other hand-uploaded files may exist)
> - anything the host created itself (for example `cgi-bin`)
>
> Prefer Synchronize over Mirror, and read the deletion list before you confirm.

## 9. Maintenance

- **This repo went five months without a push** (last push before the sync: 2026-04-25; next: 2026-09-28). Commit and push after every content change:
  ```
  git add <files>
  git commit -m "describe what you changed"
  git push
  ```
- Deployment does not back anything up. Git is the backup, so a deploy without a push leaves the work in one place only.

## 10. Only the owner can confirm

- Hosting plan and renewal date, server and PHP settings.
- Domain registrar, renewal date and DNS records; whether `draft.thedefenderfamily.com` is still in use and whether the live site is on the apex domain.
- The Transmit bookmark and its sync settings; the actual contents of `public_html/`.
- Whether the host's cache needs purging after a deploy (the old cheat sheet has a `curl -X PURGE` command with a hard-coded IP; not checked).
- The Behold Instagram widget account (feed ID `ZRRFuff4HiLuRR0ujn3l` in `stories.njk`) and its plan.
- GitHub account ownership and access for `rafa-official/thedefenderfamily-site`.
- Where any contact form submissions go, if the contact pages use forms (not traced).
