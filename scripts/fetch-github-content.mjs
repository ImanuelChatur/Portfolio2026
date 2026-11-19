// Build-time content fetch. Pulls writeups (a Markdown repo) and projects (repos tagged with a topic)
// from GitHub, merges hand-written content/ on top (local wins), and writes public/content/{type}/.
//
//   node scripts/fetch-github-content.mjs            fetch from GitHub, fall back to .cache when offline
//   node scripts/fetch-github-content.mjs --local    local content/ only, no network (or SKIP_GITHUB=1)
//
// Env: GITHUB_TOKEN (optional, raises the rate limit), CI (any fetch error fails the build, except a
// missing writeups repo), GITHUB_API_URL (API base, defaults to https://api.github.com),
// CONTENT_CONFIG (config path, defaults to content.config.json), CONTENT_DEBUG=1 (log skipped files).
import { cp, lstat, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import matter from 'gray-matter';
import {
  cleanFrontMatter,
  isPortfolioRepo,
  isPublishable,
  parseFrontMatter,
  projectMetaFromRepo,
  resolveRepoPath,
  rewriteRelativeLinks,
  slugify,
  stripDuplicateH1,
  TOKEN_PATTERN
} from './lib/content-transform.mjs';

const TYPES = ['projects', 'writeups'];
const OUT = path.join('public', 'content');
const LOCAL = 'content';
const CACHE = path.join('.cache', 'github-content');
const TAR_DIR = path.join('.cache', 'writeups-tarball');
const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)$/i;

const API = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/+$/, '');
const TOKEN = process.env.GITHUB_TOKEN?.trim() || '';
const IN_CI = Boolean(process.env.CI) && process.env.CI !== 'false';
const LOCAL_ONLY = process.argv.includes('--local') || ['1', 'true'].includes(process.env.SKIP_GITHUB ?? '');
const DEBUG = Boolean(process.env.CONTENT_DEBUG);

const debug = (...args) => DEBUG && console.log('github: [debug]', ...args);
const warn = msg => console.warn(`github: WARNING ${msg}`);

class HttpError extends Error {
  constructor(status, url, detail = '') {
    super(`GitHub API ${status} for ${url}${detail ? ` (${detail})` : ''}`);
    this.status = status;
  }
}

// ---------- HTTP ----------

function headers(accept = 'application/vnd.github+json') {
  const h = { Accept: accept, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'portfolio-build' };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

async function request(pathOrUrl, { accept, timeout = 20_000 } = {}) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : API + pathOrUrl;
  // Only the URL (never headers) goes into error messages, so the token can't leak into logs.
  let res;
  try {
    res = await fetch(url, { headers: headers(accept), signal: AbortSignal.timeout(timeout) });
  } catch (err) {
    const reason = err.name === 'TimeoutError' ? 'timed out' : err.cause?.code || err.cause?.errors?.[0]?.code || err.cause?.message || err.message;
    throw new Error(`network error for ${url}: ${reason}`);
  }
  if (!res.ok) {
    const limited = res.headers.get('x-ratelimit-remaining') === '0';
    throw new HttpError(res.status, url, limited ? 'rate limit exceeded; set GITHUB_TOKEN' : res.statusText);
  }
  return res;
}

async function getJson(p) {
  return (await request(p)).json();
}

/** GET a repo file via the contents API; null on 404. Returns { path, text }. */
async function getRepoFile(apiPath) {
  try {
    const file = await getJson(apiPath);
    if (file.type !== 'file' || typeof file.content !== 'string') return null;
    return { path: file.path, text: Buffer.from(file.content, 'base64').toString('utf8') };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

// ---------- Writeups ----------

async function walkMarkdown(dir, rel = '') {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) found.push(...(await walkMarkdown(path.join(dir, entry.name), relPath)));
    else if (entry.isFile() && /\.md$/i.test(entry.name)) found.push(relPath);
  }
  return found;
}

function writeupSlug(relPath) {
  const parts = relPath.split('/');
  const file = parts.at(-1);
  if (/^(readme|index)\.md$/i.test(file)) {
    return parts.length > 1 ? slugify(parts.at(-2)) : null; // root README is the repo's own readme
  }
  return slugify(file.replace(/\.md$/i, ''));
}

async function fetchWriteups(config, stage) {
  const { repo, branch = 'main', path: subPath = '' } = config.writeups;
  const user = config.githubUser;
  const dir = path.join(stage, 'writeups');
  await mkdir(dir, { recursive: true });

  let res;
  try {
    res = await request(`/repos/${user}/${repo}/tarball/${encodeURIComponent(branch)}`, { timeout: 120_000 });
  } catch (err) {
    if (err.status === 404) {
      warn(`writeups repo ${user}/${repo} not found; 0 GitHub writeups`);
      return 0;
    }
    throw err;
  }

  await rm(TAR_DIR, { recursive: true, force: true });
  await mkdir(TAR_DIR, { recursive: true });
  await writeFile(path.join(TAR_DIR, 'repo.tar.gz'), Buffer.from(await res.arrayBuffer()));
  // Relative paths + cwd: GNU tar (Git Bash) would read "C:\..." as a remote host.
  await promisify(execFile)('tar', ['-xzf', 'repo.tar.gz'], { cwd: TAR_DIR });
  await rm(path.join(TAR_DIR, 'repo.tar.gz'));

  const top = (await readdir(TAR_DIR, { withFileTypes: true })).find(e => e.isDirectory());
  if (!top) throw new Error(`writeups tarball for ${user}/${repo} was empty`);
  const repoRoot = path.join(TAR_DIR, top.name);
  const base = subPath.replace(/^\/+|\/+$/g, '');
  const walkRoot = path.join(repoRoot, ...base.split('/').filter(Boolean));
  if (!existsSync(walkRoot)) throw new Error(`writeups path "${base}" not found in ${user}/${repo}@${branch}`);

  const seen = new Set();
  let published = 0;
  let skipped = 0;

  for (const relInWalk of await walkMarkdown(walkRoot)) {
    const repoPath = base ? `${base}/${relInWalk}` : relInWalk;
    const slug = writeupSlug(relInWalk);
    if (!slug) continue;

    let parsed;
    try {
      parsed = parseFrontMatter(await readFile(path.join(repoRoot, ...repoPath.split('/')), 'utf8'));
    } catch {
      skipped++;
      debug(`skip ${repoPath}: unreadable front matter`);
      continue;
    }
    if (!isPublishable(parsed.data)) {
      skipped++;
      debug(`skip ${repoPath}: no front matter / missing fields / draft`);
      continue;
    }
    if (seen.has(slug)) {
      warn(`duplicate writeup slug "${slug}" (${repoPath}); keeping the first`);
      continue;
    }
    seen.add(slug);

    const fileDir = path.posix.dirname(repoPath) === '.' ? '' : path.posix.dirname(repoPath);
    const copies = [];
    const body = rewriteRelativeLinks(parsed.content, ({ url, kind }) => {
      const resolved = resolveRepoPath(fileDir, url);
      if (!resolved || kind !== 'image' || !IMAGE_EXT.test(resolved.path)) return null;
      const relToFile = path.posix.relative(fileDir, resolved.path);
      const target = relToFile.startsWith('..') ? `_root/${resolved.path}` : relToFile;
      copies.push({ from: resolved.path, to: target });
      return encodeURI(`content/writeups/${slug}/${target}`) + resolved.suffix;
    });

    for (const { from, to } of copies) {
      const src = path.join(repoRoot, ...from.split('/'));
      const info = await lstat(src).catch(() => null);
      if (!info?.isFile()) {
        warn(`writeup "${slug}" references missing image ${from}`);
        continue;
      }
      const dest = path.join(dir, slug, ...to.split('/'));
      await mkdir(path.dirname(dest), { recursive: true });
      await cp(src, dest);
    }

    const source = `https://github.com/${user}/${repo}/blob/${branch}/${encodeURI(repoPath)}`;
    await writeFile(path.join(dir, `${slug}.md`), matter.stringify(body, cleanFrontMatter({ ...parsed.data, source })));
    published++;
  }

  await rm(TAR_DIR, { recursive: true, force: true });
  console.log(`github: writeups ${user}/${repo}@${branch}: ${published} published, ${skipped} skipped`);
  return published;
}

// ---------- Projects ----------

async function listRepos(user) {
  const repos = [];
  let next = `/users/${user}/repos?per_page=100&type=owner&sort=pushed`;
  while (next) {
    const res = await request(next);
    repos.push(...(await res.json()));
    next = /<([^>]+)>;\s*rel="next"/.exec(res.headers.get('link') ?? '')?.[1] ?? null;
  }
  return repos;
}

async function fetchProjects(config, stage) {
  const user = config.githubUser;
  const cfg = config.projects;
  const dir = path.join(stage, 'projects');
  await mkdir(dir, { recursive: true });

  const all = await listRepos(user);
  const repos = all.filter(r => isPortfolioRepo(r, cfg));
  let written = 0;

  for (const repo of repos) {
    const owner = repo.owner.login;
    const name = repo.name;
    const branch = repo.default_branch;
    const bodyFile = cfg.bodyFile
      ? await getRepoFile(`/repos/${owner}/${name}/contents/${encodeURIComponent(cfg.bodyFile)}`)
      : null;
    const portfolio = bodyFile ? parseFrontMatter(bodyFile.text) : null;

    const meta = projectMetaFromRepo(repo, portfolio?.data ?? {}, cfg);
    if (!meta) {
      warn(`skipping project ${owner}/${name}: no description (add one on GitHub or a summary in ${cfg.bodyFile})`);
      continue;
    }

    let source = bodyFile && portfolio.content.trim() ? { path: bodyFile.path, text: portfolio.content } : null;
    if (!source) {
      const readme = await getRepoFile(`/repos/${owner}/${name}/readme`);
      source = readme ? { path: readme.path, text: parseFrontMatter(readme.text).content } : { path: '', text: '' };
    }

    const fileDir = path.posix.dirname(source.path) === '.' ? '' : path.posix.dirname(source.path);
    const body = rewriteRelativeLinks(stripDuplicateH1(source.text, meta.title, name), ({ url, kind }) => {
      const resolved = resolveRepoPath(fileDir, url);
      if (!resolved) return null;
      const p = encodeURI(resolved.path);
      return kind === 'image'
        ? `https://raw.githubusercontent.com/${owner}/${name}/${branch}/${p}${resolved.suffix}`
        : `https://github.com/${owner}/${name}/blob/${branch}/${p}${resolved.suffix}`;
    });

    await writeFile(path.join(dir, `${slugify(name)}.md`), matter.stringify(body, cleanFrontMatter(meta)));
    written++;
  }

  console.log(`github: projects: ${written} written (${repos.length} of ${all.length} repos tagged "${cfg.topic}")`);
  return written;
}

// ---------- Cache, merge, safety ----------

/** Fetch one type into a staging dir; on success it becomes the last-good cache. */
async function refresh(type, fetcher, config) {
  const stage = path.join(CACHE, `.stage-${type}`);
  await rm(stage, { recursive: true, force: true });
  try {
    await fetcher(config, stage);
    await rm(path.join(CACHE, type), { recursive: true, force: true });
    await cp(path.join(stage, type), path.join(CACHE, type), { recursive: true });
    return path.join(CACHE, type);
  } catch (err) {
    if (IN_CI) throw err;
    const cached = path.join(CACHE, type);
    if (existsSync(cached)) {
      warn(`${type} fetch failed (${err.message}); using last good copy from ${cached}`);
      return cached;
    }
    warn(`${type} fetch failed (${err.message}); no cache, using local content only`);
    return null;
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

async function mergeLocal(type) {
  const src = path.join(LOCAL, type);
  const dest = path.join(OUT, type);
  if (!existsSync(src)) return;
  // Unpublishable local files (drafts, missing front matter) are not copied at all, so a draft
  // is not reachable by URL either. A local draft also hides a GitHub copy with the same slug.
  const hidden = new Set();
  for (const entry of await readdir(src, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const slug = entry.name.replace(/\.md$/, '');
      if (existsSync(path.join(dest, entry.name))) debug(`local ${type}/${entry.name} overrides GitHub copy`);
      await rm(path.join(dest, slug), { recursive: true, force: true }); // drop GitHub assets for that slug
      if (!isPublishable(matter(await readFile(path.join(src, entry.name), 'utf8')).data)) {
        debug(`skip local ${type}/${entry.name}: no front matter / missing fields / draft`);
        await rm(path.join(dest, entry.name), { force: true });
        hidden.add(slug);
      }
    }
  }
  await cp(src, dest, {
    recursive: true,
    force: true,
    filter: file => {
      const [top] = path.relative(src, file).split(path.sep);
      return !hidden.has(top.replace(/\.md$/, ''));
    }
  });
}

async function assertNoTokens(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath ?? entry.path, entry.name);
    const text = await readFile(file, 'latin1');
    if (TOKEN_PATTERN.test(text) || (TOKEN && text.includes(TOKEN))) {
      await rm(OUT, { recursive: true, force: true });
      throw new Error(`refusing to publish ${file}: it contains something that looks like a GitHub token`);
    }
  }
}

// ---------- Main ----------

async function main() {
  const config = JSON.parse(await readFile(process.env.CONTENT_CONFIG || 'content.config.json', 'utf8'));

  const sources = {};
  if (LOCAL_ONLY) {
    console.log('github: local mode, skipping GitHub (content/ only)');
  } else {
    console.log(`github: fetching for ${config.githubUser} (${TOKEN ? 'authenticated' : 'unauthenticated'})`);
    sources.writeups = await refresh('writeups', fetchWriteups, config);
    sources.projects = await refresh('projects', fetchProjects, config);
  }

  for (const type of TYPES) {
    const dest = path.join(OUT, type);
    await rm(dest, { recursive: true, force: true });
    await mkdir(dest, { recursive: true });
    if (sources[type]) await cp(sources[type], dest, { recursive: true });
    await mergeLocal(type);
  }
  await assertNoTokens(OUT);
}

main().catch(err => {
  console.error(`github: ERROR ${err.message}`);
  process.exit(1);
});
