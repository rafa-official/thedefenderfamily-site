# The Defender Family — Site Operations

Verified against the repo on 2026-09-28. Everything below was checked in this repository. Items marked **Confirm** are things only the site owner can verify (accounts, hosting, renewals) and are collected at the end.

**Quick index — where to look:**

| Question | Section |
|---|---|
| How do I publish / edit a story, or add a page? | 10 |
| How do images work; how do I make them lighter? | 11 |
| Something is broken (build, images, stale site, language redirect) | 12 |
| Which accounts exist and where are they? | 13 |
| Why is the site built this way? | 14 |
| What should I check this month / quarter / year? | 15 |
| What is known to be wrong or missing? | 16 |
| What can't be verified from the code? | 17 |

Convention: **Confirm: Rafa** marks anything that cannot be verified from the repo and needs the owner's answer.

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
- `draft: true` removes a story from the `stories` collection (the `/stories/` list and related-stories) and from the sitemap. **It does not stop the page being built or deployed**: tested 2026-09-28, a draft story is still written to `_site/stories/<slug>/index.html` and is reachable by URL, with the normal indexable robots meta. No story currently sets `draft`.
- There is no publish-date gate: a story with a future `date` is built, listed and added to the sitemap immediately (tested 2026-09-28).
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
- **All images in `_site/images/uploads/` are now in `src/images/uploads/` and tracked** (80 files, about 31 MB, copied 2026-09-28 and committed as `87bc8b0`). The build now prints one distinct `[image] Could not process:` warning, for `defender-trophy-finalist-europe-2026.jpg`. Two referenced files still exist nowhere on disk: `defender-trophy-finalist-europe-2026.jpg` and `camel-trophy-poster-90.jpg` (see section 16, item 1). Their `.webp` versions are tracked.
- Some of the 80 copied files are not referenced by any page (for example `Machu_Picchu66.jpg` and `PHOTO-2023-04-07-17-07-54.jpg`); they were copied because they were on the server build.
- **Size against GitHub limits (2026-09-28):** the largest tracked file is 22 MB (limits: 50 MB warning, 100 MB rejection per file). The local `.git` folder is about 215 MB, and `src/images/uploads` is about 91 MB. GitHub recommends keeping a repository under 1 GB, so there is room. A new hero video near 50 MB would need Git LFS or hosting elsewhere. Every re-saved or re-exported image adds a new full copy to history, so avoid committing the same photo repeatedly.

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

## 10. How-to: stories and pages

### Publish a new story (from "I have text and photos" to "it's live")

1. **Prepare the photos.** Hero image: `.jpg`, about 1600–1920 px wide. Content images: about 1200 px. Use lowercase, hyphenated, descriptive filenames. For the hero, also make a `.webp` with the same name (see section 11). Put both in `src/images/uploads/`.
2. **Create the file** `src/stories/<slug>.md`. The filename becomes the URL: `where-is-padme.md` → `/stories/where-is-padme/`. Renaming later changes the URL (see "Edit a story").
3. **Add front matter** (all fields as in section 4). Quote any value containing a colon, for example `title: "Part 1: The beginning"` (an unquoted colon breaks the build, see section 12). Use `tags: stories`. Set `date: YYYY-MM-DD`.
4. **Write the body in Markdown.** `##` gives a section heading; a `>` blockquote is styled by `.article-content blockquote` in `style.css`. Insert photos with `{% image "/images/uploads/your-photo.jpg", "describe the image" %}`. The body is processed as Nunjucks, so any literal `{{`, `{%` or `{#` in the text is treated as code.
5. **Preview:** `npm start`, then open the address Eleventy prints (default `http://localhost:8080`). Check the story page, its card on `/stories/`, and the hero on a narrow window.
6. **Build:** `npm run build`. Read the output for `[image] Could not process:` lines; every one means an image is missing from `src/`.
7. **Commit and push** the new `.md` and image files: `git add src/stories/<slug>.md src/images/uploads/<files>`, `git commit -m "Add story: <title>"`, `git push`.
8. **Deploy** per section 8 (Synchronize; read the deletion list first).
9. **Verify live:** the story URL, the card on `/stories/`, and that the URL appears in `/sitemap.xml`. If the old version shows, see "stale content" in section 12.

To hold a story back, `draft: true` is **not sufficient on its own** (the page is still deployed and reachable). To keep it fully private, leave it out of the commit and the deploy.

There is no Spanish story pipeline: stories are English-only and carry no `translations`.

### Edit an existing story

1. Edit `src/stories/<slug>.md`, then preview and build as above.
2. Changing `date` reorders the list (newest first) and changes the sitemap `lastmod`.
3. **Do not rename the file or change its slug** unless you also add a redirect. The site has no redirect rules (`.htaccess` holds only the 404 page), so the old URL becomes a 404. **Confirm: Rafa** whether the host allows Apache redirect rules in `.htaccess`.
4. Commit, push, deploy, verify.

### Add a new page

1. Create `src/<name>.njk` (Spanish: `src/es/<name>.njk`) with front matter:
   ```yaml
   ---
   layout: layouts/base.njk
   title: "Page title"
   description: "One or two sentences for search and social."
   permalink: /page-name/
   ogImage: "/images/uploads/....jpg"
   ogImageAlt: "..."
   priority: "0.7"
   lang: "en"
   ---
   ```
   `lang`, `priority`, `changefreq` are optional. `sitemap: false` keeps a page out of the sitemap; `robotsOverride: "noindex, nofollow"` marks it noindex; `minimalNav: true` hides the nav and footer.
2. **The nav and footer are hard-coded** in `src/_includes/layouts/base.njk` (separate English and Spanish link lists). A new page does not appear in either until you add a link there.
3. If the page has a Spanish twin, add `translations` and `defaultUrl` to **both** pages so the hreflang links are reciprocal:
   ```yaml
   translations:
     - { lang: "es", url: "/es/nombre/" }
   defaultUrl: "/page-name/"
   ```
   Only add this when the twin is an equivalent page (see section 16, item 3).
4. Use the `{% image %}` shortcode for photos, and for any hero background supply a `.webp` sibling (section 11).
5. Preview, build, commit, push, deploy, verify. Check the page appears in `/sitemap.xml` (or is deliberately absent).

## 11. Images

### What happens automatically

The `image` shortcode (`.eleventy.js`), used as `{% image "/images/uploads/x.jpg", "alt text", "lazy", "sizes", "css-class", "style" %}` (only the first two arguments are required):

- reads the source from `src/` (a path starting with `/` is resolved under `./src`);
- generates 400, 800 and 1200 px versions in **WebP and JPEG** into `_site/img/`, named `<name>-<width>w.<ext>`;
- outputs a `<picture>` with `srcset`, `sizes` (default `(max-width: 768px) 100vw, 50vw`), `loading` (default `lazy`), `decoding="async"` and your `alt`;
- **if processing fails** (for example the source file is missing) it prints `[image] Could not process: <path> — <reason>` and outputs a plain `<img src=...>` pointing at the original path. The build still succeeds, so the failure is easy to miss.

Where it is used: the story cards on `/stories/`, related stories and tag pages, and the photo blocks in most pages and stories.

`_site/img/` is generated output and must be uploaded along with the rest of `_site/`.

### What is NOT automatic (needs a manual `.webp` sibling)

- **Story hero images.** `article.njk` builds the hero as a CSS `image-set()` with the `.webp` name derived from `heroImage` by replacing `.jpg`/`.jpeg` with `.webp`. The `.webp` must sit next to the `.jpg`.
- **Page hero backgrounds.** Templates that use inline `background-image: image-set(url('x.webp') …, url('x.jpg') …)` (for example the `/stories/` hero) need `x.webp` next to `x.jpg`. Current explicit `.webp` references: `girl-rooftop-tent-beach`, `land-rover-defender-alucab-driving-dirtroad-turkey`, `land-rover-defender-in-albanian-alps_002`, `overlander-digital-nomads-with-a-land-rover-defender_003`, `rafa-lanus-photographer-car`, `the-defender-family-404`, `the-defender-family-and-friends-mountain`, `the-defender-family-sophie-on-board_004`, `the-defender-family-sunrise-moment`.
- **Not converted at all:** the logo and site icon (plain PNG `<img>`), OG/social images (keep them JPG), and videos.

How the `.webp` files are made: the old cheat sheet points to `https://squoosh.app/editor` as the JPG → WebP converter. **Confirm: Rafa** the quality and size settings used, and whether any other tool is used.

**Current gap:** the `.webp` files for the story heroes and page heroes are now tracked in `src/`. The exceptions are the two missing originals in section 16, item 1.

### Making images lighter

1. Resize before adding: hero 1600–1920 px wide, cards about 800, content about 1200 (from the old cheat sheet). Sources over about 2000 px are wasted.
2. Prefer `{% image %}` over a raw `<img>` or a CSS background, because only the shortcode produces responsive sizes.
3. Set a realistic `sizes` argument (for example `(max-width: 768px) 100vw, 33vw` for a card) so phones do not download the 1200 px version.
4. Remember the original files are deployed too: `src/images` is copied whole into `_site/images` (currently about 59 MB), in addition to the generated `_site/img/` (about 25 MB). Large originals cost hosting space even when the page uses the resized copies.
5. Videos are the heaviest items: `hero-desktop.mp4` 22 MB, `hero-mobile.mp4` 7.2 MB, `Trophy VR.mp4` 3.7 MB. **Confirm: Rafa** what tool and settings are used to compress video.

## 12. Troubleshooting

**Build fails with "Having trouble reading front matter … YAMLException"**
The front matter block between the `---` lines is invalid YAML. The message names the file and line. Tested causes: an unclosed quote (`title: "Broken`), and an unquoted colon inside a value (`title: Part 1: The beginning`). Fix by quoting the whole value.

**Build fails with "Having trouble rendering njk template … Template render error"**
Nunjucks found unbalanced or unwanted code in the story or page. The message names the file. Tested causes: `{% if x %}` without `{% endif %}` (`parseIf: expected elif, else, or endif, got end of file`) and a stray `{#` (`expected end of comment, got end of file`). Because stories are processed as Nunjucks, literal braces in the text must be wrapped in `{% raw %}…{% endraw %}` (standard Nunjucks; not tested here).

**After any build error**
Eleventy writes no "Wrote N files" summary. `_site/` is **never cleaned**, so it still holds the previous build; deploying then uploads the old site with none of your changes. Fix the error and rebuild before deploying.

**An image does not appear**
1. Build and look for `[image] Could not process: <path>`. It means the file is not in `src/images/uploads/`.
2. Check the filename in the page matches the file exactly, including extension (`.jpg` vs `.jpeg`). The live server is Linux, where names are case-sensitive, while macOS is not; a mismatch works locally and fails live. No case mismatches exist as of 2026-09-28.
3. A story hero or page hero that is blank usually means the `.webp` sibling is missing (section 11).
4. Confirm the generated `_site/img/` folder and the original `_site/images/` files were both uploaded.
5. Avoid spaces in filenames (`Trophy VR.mp4` is the one existing exception); use hyphens.

**A new story does not show up on `/stories/`**
It must be in `src/stories/` with a `.md` extension and valid front matter, and must not have `draft: true`. Then rebuild. A `date` in the future still shows up (no gate).

**A draft story is visible on the live site**
Expected: `draft: true` only hides it from the list, related stories and sitemap. Remove the source file, rebuild, and remove the remote copy from `public_html/stories/<slug>/` manually (**Confirm: Rafa** how Transmit's Synchronize treats files deleted locally).

**The live site shows old content after a deploy**
1. Did you run `npm run build` first? Check `_site/` timestamps.
2. Did Transmit upload the changed files (direction Local → Remote, correct folder)?
3. Are you viewing the right host (`draft.` or the live domain)? **Confirm: Rafa** which is the live one.
4. Hard-refresh the browser.
5. The old cheat sheet describes a host cache purge command with a hard-coded IP; **Confirm: Rafa** whether it is still valid and where the host's cache setting lives.

**Language redirect problems**
What the code does (`base.njk`, in every page's head):
- The script runs on **the first page load of each browser session** and sets `sessionStorage.langRedirected` immediately, whichever page it is.
- It looks at `navigator.language`. If it starts with `es` and the path is exactly `/`, it goes to `/es/`. If it does not start with `es` and the path is exactly `/es/`, it goes to `/`. No other path is ever redirected.
- To test: use a private window or clear session storage, and change the browser language.
- Known consequences: a visitor whose browser is not Spanish and whose first page is `/es/` (a shared link, a search result) is sent to the English home page, and a Spanish visitor who lands first on `/about/` is not redirected and is not offered Spanish except via the EN/ES switcher. Whether search engine crawlers are affected is **not verified**. See section 16, item 6.

**Google Analytics shows no data**
Analytics only loads after the visitor clicks Accept in the cookie banner (stored as `localStorage.ga_consent = granted`). Declined or undecided visitors are not counted. The measurement ID is in `base.njk` (two copies of the loader).

**Contact form errors**
The form posts to Formspree from `src/contact.njk` and `src/es/contacto.njk` via `fetch`; success redirects to `/thank-you/` or `/es/gracias/`, failure shows a red "Something went wrong" line. There is a hidden `_gotcha` honeypot field. If submissions stop arriving, check the Formspree account and its notification email (**Confirm: Rafa**).

**Instagram feed missing on `/stories/`**
The feed is a Behold widget loaded from `w.behold.so`. Check the Behold account and feed (**Confirm: Rafa**).

## 13. Accounts and where credentials live

Names and locations only. The repo contains no credentials (searched `src/`, `.eleventy.js` and `package.json` for keys, tokens and passwords on 2026-09-28: none). Where credentials are stored is **Confirm: Rafa** in every case.

| Service | Used for | Where it shows up in the repo | Login / credentials |
|---|---|---|---|
| SiteGround | Hosting (`public_html/`) | Old cheat sheet only; not in code | **Confirm: Rafa** |
| Transmit (app) | Uploading `_site/` | Old cheat sheet only | Bookmark stores the login; **Confirm: Rafa** |
| GitHub | Source backup: `rafa-official/thedefenderfamily-site` | `git remote -v` | **Confirm: Rafa** (which account owns it, who has access) |
| Formspree | Contact form delivery | Form ID in `src/contact.njk` and `src/es/contacto.njk` | **Confirm: Rafa** |
| Behold | Instagram feed widget | Feed ID in `src/stories.njk` | **Confirm: Rafa** |
| Google Analytics 4 | Visitor stats | Measurement ID in `src/_includes/layouts/base.njk` (twice) | **Confirm: Rafa** |
| Domain registrar (`thedefenderfamily.com`) | Domain and DNS | Not in the repo | **Confirm: Rafa** |
| Google Search Console | Search monitoring | Mentioned only in a comment in `src/_redirects` | **Confirm: Rafa** whether the property is verified |
| Netlify (former) | Hosting and CMS login, used 2026-04-20 to 04-24 and then removed from the repo | History only (section 14) | **Confirm: Rafa** whether the account, its GitHub integration and Identity users still exist and should be closed |
| Google Fonts | Fonts loaded from Google's servers | `base.njk` | No account needed |
| Squoosh | JPG → WebP converter | Old cheat sheet | No account |

## 14. Decisions on record

Rationale is only listed where the repo states it. Everything else is marked **Confirm: Rafa**.

| Decision | Evidence in the repo | Why |
|---|---|---|
| **No Netlify** (host on SiteGround, deploy by hand) | Netlify was tried first: `netlify.toml`, a `src/admin/` Netlify CMS (git-gateway) and a Netlify Identity widget were added 2026-04-20/21 (`a7f2c9b`, `25ea100`). Three further commits changed the Eleventy config filename and the build command in `netlify.toml` (`89eba8e`, `3d1ab53`, `46ed5d2`). All Netlify files were deleted 2026-04-24 (`5524fcc`, message "describe what you changed"). The old cheat sheet then describes SiteGround plus Transmit. Leftovers: the Netlify-syntax `src/_redirects` (inactive), `Disallow: /admin/` in `robots.txt`, and passthrough lines for `src/admin` and `src/static` in `.eleventy.js`. | **Confirm: Rafa** |
| **Spanish site in a `/es/` subdirectory** | Spanish pages live in `src/es/` with `/es/...` permalinks. The one exception is the Stories index at `/historias/`. `hreflang.njk` documents the pattern (`/es/about/`) and mentions a possible Italian version at `/it/`. | **Confirm: Rafa** (why subdirectory rather than a separate domain or subdomain) |
| **Generic `es` hreflang (not `es-ES`)** | `lang` and `translations` use the bare codes `en` and `es`; `og:locale` uses `es_ES` / `en_US`; `<html lang>` uses `es`. | **Confirm: Rafa** (whether Spain-only or all Spanish speakers is intended) |
| **"Expeditions" renamed to "Stories"** | Done in the sync commit `ec1f96b` (2026-09-28): `expeditions-index.njk` → `stories.njk`, `src/expeditions/` → `src/stories/`, tag `expeditions` → `stories`. Earlier commits and the Netlify CMS config used "expeditions". "Expedition" survives as a `category` label on two stories, and CSS classes still start with `expedition-`. | **Confirm: Rafa**; also whether `/expeditions/` URLs were ever public (no redirect exists) |
| **`/defender-trophy-concept/` is noindex, not password-protected** | Front matter: `robotsOverride: "noindex, nofollow"`, `sitemap: false`, `minimalNav: true`. No page links to it. It is not disallowed in `robots.txt`. It is a "private concept" page (per its description) with a placeholder hero video and comment ("PLACEHOLDER: Rafa will replace…"). noindex only asks search engines to skip it; anyone with the URL can open it and its video. | **Confirm: Rafa** (why noindex rather than a password) |
| **Eleventy stays on v2** | `package.json` has declared `^2.0.1` since the first commit. The history shows a v3 attempt (`89eba8e` renamed the config to `eleventy.config.js`) reverted two commits later to a "v2 compatible config" (`46ed5d2`). | **Confirm: Rafa** (what failed on v3) |
| **Analytics only after consent** | `base.njk` loads Google Analytics only if `localStorage.ga_consent` is `granted`, set by the cookie banner. | Stated by the banner text; legal basis **Confirm: Rafa** |
| **Language auto-redirect by browser language** | Script in `base.njk` (section 12). | **Confirm: Rafa** |
| **Manual deploy with Transmit, no CI** | Old cheat sheet; no CI config in the repo. | **Confirm: Rafa** |

## 15. Maintenance calendar

**After every content change:** build, read the output for `Could not process` and errors, commit, push, then deploy and verify.

**Monthly**
- Run `npm run build` on a clean checkout of `main` (see quarterly) or at least locally, and check for `[image] Could not process:` warnings.
- `git status -sb` shows nothing ahead of `origin/main`.
- Load the live site, a story, `/stories/` (Instagram feed shows), `/sitemap.xml` and `/robots.txt`.
- Send a test message through the contact form (English and Spanish) and confirm it arrives.
- Accept cookies once and confirm Google Analytics receives the visit.
- Run `npm outdated` and `npm audit` and note what changed.
- **Confirm: Rafa** whether Search Console is checked and what to look at there.

**Quarterly**
- Prove the repo is self-sufficient: `git clone` into a scratch folder, `npm install`, `npm run build`, and compare the result with the live site (`diff -r` against `_site/`, or spot-check images and both hero videos). This catches files that exist only on your disk or server, as happened with the images fixed on 2026-09-28.
- Update dependencies **within v2**: `npm update`, rebuild, compare the output, then commit `package-lock.json`.
- Review `npm audit`; the current high-severity findings come through `sharp` in `@11ty/eleventy-img` (section 16, item 10).
- Check the Node version. This machine runs Node 25, an odd-numbered "Current" release that never becomes LTS; Eleventy 2.0.1 declares `node >=14`. **Confirm: Rafa** whether you want to move to an LTS release.
- Test the language redirect and the EN/ES switcher (section 12).
- Review image weight: largest images and videos (section 11).
- Delete the stale local `claude/*` branches if no longer needed (`git branch`).

**Yearly**
- **January:** update the copyright year. `© 2026` is hard-coded in `base.njk`, in both the English and Spanish footers.
- Renew domain and hosting; renewal dates are **Confirm: Rafa**. Confirm SSL renews (**Confirm: Rafa**).
- Review who has access to GitHub, SiteGround, Formspree, Behold and Google Analytics (**Confirm: Rafa**).
- Review Eleventy: `npm outdated` currently shows v3.1.6 as latest against 2.0.1 installed (checked 2026-09-28). Upgrade only deliberately, as below.
- Re-read this document and update it.

**Caution: Eleventy v2 → v3**
- Do it on a branch, never straight on `main`, and never deploy from the branch until compared.
- The one earlier attempt was reverted (section 14). Find out what failed before retrying (**Confirm: Rafa**).
- Build both versions into separate folders (`--output=...`) and `diff -r` them. Check URLs, `sitemap.xml`, hreflang tags, the `image` shortcode output, tag pages, and story ordering.
- `@11ty/eleventy-img` also has a newer major (7.0.0). `npm audit fix --force` would install it, which is a breaking change; test the shortcode after any bump.
- I believe v3 changes how `draft: true` is treated (native draft handling), which would change the behaviour noted in section 4. This is **not verified here**; read the v3 release notes first.
- Check the minimum Node version v3 requires against the installed one.

## 16. Open items

Known gaps, most serious first.

1. **Two referenced images exist nowhere on disk** (resolved for the other 80). On 2026-09-28 all 80 files that existed only in `_site/images/uploads/` were copied into `src/images/uploads/` and committed (`87bc8b0`). Still missing:
   - `defender-trophy-finalist-europe-2026.jpg`: used as `heroImage` and `ogImage` of "Defender is a verb", in its body, and on `/defender-trophy-concept/`. Its `.webp` is now tracked, but the `{% image %}` shortcode needs the `.jpg` (4 build warnings), and social sharing needs a JPG for the OG image.
   - `camel-trophy-poster-90.jpg`: used in the body of "Defender is a verb" as a plain Markdown image, so it produces no build warning and shows a broken image. Its `.webp` is tracked.
   **Confirm: Rafa** where the originals are. Once found, put them in `src/images/uploads/`, rebuild until there are no warnings, then commit, push and deploy.
   Note: when `_site/` is rebuilt, images referenced only by raw CSS, `<img>` tags or Markdown never warn, so periodically compare `src/images/uploads/` with the references.
2. **No Article JSON-LD in `article.njk`.** Story pages have no structured data. JSON-LD exists only in `project.njk` and `work-with-us.njk`.
3. **One-way hreflang.** `src/es/historias.njk` lists `/stories/` as its English alternate, but `/stories/` no longer lists `/historias/` (removed 2026-09-28 because it is a placeholder). Google expects hreflang to be reciprocal. Decide: remove `translations` from `es/historias.njk` too, or add reciprocal links once real Spanish stories exist.
4. **`/historias/` breaks the `/es/` pattern.** Every other Spanish page is under `/es/`.
5. **Drafts are deployed.** `draft: true` does not stop the page being built, and the page has no noindex (section 4). Future dates publish immediately.
6. **Language redirect acts on the first page of a session, and bounces non-Spanish browsers away from `/es/`.** Whether search crawlers are affected is not verified.
7. **No redirects anywhere.** `.htaccess` holds only the 404 page, `src/_redirects` is fully commented out and uses Netlify syntax, and there is no `/expeditions/` → `/stories/` redirect, no HTTPS rule and no www rule. **Confirm: Rafa** what the host enforces.
8. **Netlify CMS leftovers:** `Disallow: /admin/` in `robots.txt`, and `src/admin` and `src/static` passthroughs in `.eleventy.js`, point at folders that do not exist. Also unused: the `projects` collection and `project.njk` (there is no `src/projects/`).
9. **The old cheat sheet is out of date** (`_README-TDF-Workflow Cheat Sheet.rtfd`, still committed): `~/Downloads/tdf-site` path, `src/expeditions/`, `tags: expeditions`, and the `draft.` host. Update or remove it so this document is the single source.
10. **`npm audit` reports 3 high-severity issues** in `sharp` via `@11ty/eleventy-img` 6.0.4. The suggested fix is a breaking upgrade to 7.0.0.
11. **`_site/.DS_Store` is deployed.** `.gitignore` excludes it from git but not from the upload.
12. **Copyright year `© 2026` is hard-coded** in `base.njk` (both languages).
13. **Sitemap `lastmod`:** story pages use the front matter `date`, but the other pages appear to use the file's creation time (Eleventy's default), so values are arbitrary and reset on a fresh clone.
14. **Social image size:** `base.njk` always writes `og:image:width/height` as 1200×630, but the default OG image is 1220×630.
15. **Third-party loading vs. the consent banner:** the banner says no data is shared with third parties, yet Google Fonts, the Behold widget and Formspree load or post without asking, and Google Analytics is itself a third party. **Confirm: Rafa** whether the banner wording is accurate for your audience.
16. **Trophy concept page** still has placeholder content and comments and is reachable by URL (section 14).
17. **Three local `claude/*` branches** exist that are not on GitHub.

## 17. Only the owner can confirm

- Hosting: SiteGround plan, renewal date, PHP and server settings, cache setting, and whether Apache redirect rules are allowed in `.htaccess`.
- Domain: registrar, renewal date, DNS records; whether `draft.thedefenderfamily.com` is still in use; which host is the live site.
- The Transmit bookmark and sync settings, and the real contents of `public_html/` (needed for the section 8 checklist).
- All account owners, logins and credential storage in section 13, including whether Netlify was fully closed.
- Where the original `defender-trophy-finalist-europe-2026.jpg` and `camel-trophy-poster-90.jpg` are.
- The reasons in section 14 marked **Confirm: Rafa**.
- Image and video compression tools and settings (section 11).
- Whether Search Console is set up and checked; whether Analytics/Formspree/Behold plans are paid or free.
- Whether the cookie banner wording is accurate (section 16, item 15).
