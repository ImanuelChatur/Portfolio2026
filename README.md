# Portfolio2026

Personal portfolio of Imanuel Chatur: an Angular app deployed to GitHub Pages at
<https://imanuelchatur.github.io/Portfolio2026/>.

Projects and writeups are pulled from GitHub **at build time**. Adding a writeup or project means pushing
to GitHub, not editing this repo. The browser never calls the GitHub API and no token is shipped.

## How content works

```
 imanuelchatur/writeups (main)        imanuelchatur/* repos with topic `portfolio`
   Markdown + front matter              README.md or PORTFOLIO.md
            \                                   /
             scripts/fetch-github-content.mjs  (build time)
                            |
   content/{projects,writeups}/  (hand-written, committed; wins on slug collision)
                            |
             public/content/{projects,writeups}/   (generated, gitignored)
               <slug>.md, <slug>/ assets, index.json  <- scripts/build-content-index.mjs
                            |
                    Angular app loads content/...
```

- Configuration: `content.config.json` (GitHub user, writeups repo/branch/path, project topics, body file).
- Every successful fetch is saved to `.cache/github-content/`. When GitHub can't be reached locally, the
  last good copy is used (or local content only), so `npm start` works offline.
- In CI (`CI` set), any GitHub error fails the build, except a 404 for the writeups repo, which only warns.
- Before finishing, the script refuses to write anything under `public/content/` that looks like a GitHub token.

## Writeups

A Markdown file in the writeups repo is published **only** if it has front matter with `title`, `date` and
`summary`, and is not `draft: true`. Files without front matter are skipped silently, so rough notes
(unretired boxes, live CTFs) never leak.

```markdown
---
title: HTB Lame              # required
date: 2026-09-15             # required, YYYY-MM-DD
summary: SMB to root via CVE-2007-2447.   # required, one sentence
tags: [HTB, Linux, SMB]      # optional
draft: false                 # optional; true hides it
---
```

Layouts: `some-box.md` or `some-box/README.md` (or `index.md`) both give the slug `some-box`. Relative
images (`![](img/x.png)`, `<img src>`) are copied next to the writeup and their links rewritten. Each
published writeup gets a `source:` link to the original file.

## Projects

1. Add the topic `portfolio` to a public, non-fork, non-archived repo (add `featured` to feature it).
2. Give the repo a description: it becomes the summary. Without one (and no `summary` override) the repo
   is skipped with a warning.
3. Optional: add `PORTFOLIO.md` to the repo root. Its front matter (`title`, `summary`, `date`, `tags`,
   `featured`, `thumbnail`) overrides the derived values, and its body replaces the README as the case study.

Derived values: title from the repo name, date from creation, tags from topics plus the main language,
plus repo link, homepage (as demo) and stars. Relative links in the README point back to GitHub.

## Local commands

```bash
npm start                       # fetch content, then ng serve on http://localhost:4200/
npm run content                 # fetch from GitHub + build indexes
npm run content -- --local      # local content/ only, no network (also: npm run content:local, SKIP_GITHUB=1)
npm run build                   # production build
npm test                        # Angular unit tests
npm run test:scripts            # unit tests for the content scripts
```

Unauthenticated GitHub requests are limited to 60/hour. To raise the limit locally, set a token for the
session, e.g. in Git Bash: `export GITHUB_TOKEN=$(gh auth token)`. The token is only sent to the GitHub API
and is never logged or written to disk. `CONTENT_DEBUG=1` lists skipped writeup files.

## Deploy

GitHub Pages with **Settings > Pages > Source = GitHub Actions**. `.github/workflows/deploy.yml` runs
`npm run build:pages` (content, production build with base href `/Portfolio2026/`, route copies for deep links).

To rebuild the site when the writeups repo changes, add this workflow there as
`.github/workflows/notify-portfolio.yml`:

```yaml
on: { push: { branches: [main] } }
jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -fsS -X POST \
            -H "Authorization: Bearer ${{ secrets.PORTFOLIO_DISPATCH_TOKEN }}" \
            -H "Accept: application/vnd.github+json" \
            https://api.github.com/repos/imanuelchatur/Portfolio2026/dispatches \
            -d '{"event_type":"content-updated"}'
```

`PORTFOLIO_DISPATCH_TOKEN` is a fine-grained PAT scoped to Portfolio2026 only with Contents: Read and write,
stored as a secret in the writeups repo.
