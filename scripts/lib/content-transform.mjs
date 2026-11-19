// Pure helpers for scripts/fetch-github-content.mjs. No I/O here, so everything is unit-testable.
import path from 'node:path';
import matter from 'gray-matter';

const REQUIRED = ['title', 'date', 'summary'];

// gray-matter evaluates `---js` front matter with eval(). Content comes from GitHub, so refuse it.
const NO_EVAL = {
  parse() {
    throw new Error('JavaScript front matter is not allowed');
  },
  stringify() {
    throw new Error('JavaScript front matter is not allowed');
  }
};

/** Parse front matter safely (YAML/JSON only). Returns { data, content }. */
export function parseFrontMatter(source) {
  // Passing options also bypasses gray-matter's global cache, so callers get their own objects.
  const { data, content } = matter(source, { engines: { js: NO_EVAL, javascript: NO_EVAL } });
  return { data: { ...data }, content };
}

/** `port-scanner` -> `Port Scanner`, `CPUFinalProject` -> `CPU Final Project`. */
export function humanize(name) {
  return String(name)
    .replace(/[-_.]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

/** Lower-case, URL-safe slug. */
export function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Format a Date or date-like string as YYYY-MM-DD; returns undefined if invalid. */
export function toIsoDate(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

/** A writeup is published only with title, date and summary, a valid date, and no `draft: true`. */
export function isPublishable(data) {
  if (!data || typeof data !== 'object') return false;
  if (data.draft === true || data.draft === 'true') return false;
  if (REQUIRED.some(key => data[key] === undefined || data[key] === null || String(data[key]).trim() === '')) {
    return false;
  }
  return toIsoDate(data.date) !== undefined;
}

/** True for links that point into the repo: not absolute, not protocol-relative, not an anchor. */
export function isRelativeUrl(url) {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return false;
  return !/^[a-z][a-z0-9+.-]*:/i.test(trimmed);
}

/**
 * Resolve a relative URL against a repo-relative directory (posix). `/x` is repo-root relative.
 * Returns { path, suffix } (suffix = ?query#hash) or null if it escapes the repo root.
 */
export function resolveRepoPath(fromDir, url) {
  const match = /^([^?#]*)([?#].*)?$/.exec(url.trim());
  let target = match[1];
  const suffix = match[2] ?? '';
  try {
    target = decodeURI(target);
  } catch {
    // keep as-is if it isn't valid percent-encoding
  }
  const joined = target.startsWith('/') ? target.slice(1) : path.posix.join(fromDir || '', target);
  const normalized = path.posix.normalize(joined || '.');
  if (normalized === '.' || normalized === '..' || normalized.startsWith('../') || path.posix.isAbsolute(normalized)) {
    return null;
  }
  return { path: normalized, suffix };
}

const CODE = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:^\1[^\n]*$|(?![\s\S]))|`[^`\n]+`/gm;
// [text](url "title") or ![alt](url "title"); text may hold one level of nested brackets (badges).
const MD_LINK = /(!?)\[((?:[^[\]]|\[[^[\]]*\])*)\]\(\s*(<[^>\n]*>|[^\s)]+)((?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*)\)/g;
const MD_REF = /^( {0,3}\[[^\]\n]+\]:[ \t]*)(<[^>\n]*>|\S+)/gm;
const HTML_ATTR = /(<(img|a|source|video)\b[^>]*?\s(?:src|href)\s*=\s*)(["'])(.*?)\3/gi;

/**
 * Rewrite relative links in Markdown (inline, reference-style and HTML img/a). Code spans and fenced
 * blocks are left alone, as are absolute URLs and anchors.
 * `resolve({ url, kind })` (kind: 'image' | 'link') returns the replacement URL, or null/undefined to keep it.
 */
export function rewriteRelativeLinks(markdown, resolve) {
  const apply = (url, kind) => {
    if (!isRelativeUrl(url)) return url;
    const next = resolve({ url, kind });
    return next === null || next === undefined ? url : next;
  };

  const rewriteInline = text =>
    text.replace(MD_LINK, (_all, bang, inner, rawUrl, title) => {
      const bracketed = rawUrl.startsWith('<');
      const url = bracketed ? rawUrl.slice(1, -1) : rawUrl;
      const next = apply(url, bang ? 'image' : 'link');
      const outUrl = bracketed || /\s/.test(next) ? `<${next}>` : next;
      return `${bang}[${rewriteInline(inner)}](${outUrl}${title})`;
    });

  const rewriteText = text =>
    rewriteInline(text)
      .replace(MD_REF, (_all, prefix, rawUrl) => {
        const bracketed = rawUrl.startsWith('<');
        const url = bracketed ? rawUrl.slice(1, -1) : rawUrl;
        const next = apply(url, /\.(png|jpe?g|gif|svg|webp|avif)$/i.test(url.split(/[?#]/)[0]) ? 'image' : 'link');
        return prefix + (bracketed ? `<${next}>` : next);
      })
      .replace(HTML_ATTR, (_all, prefix, tag, quote, url) => {
        const kind = /^a$/i.test(tag) ? 'link' : 'image';
        return `${prefix}${quote}${apply(url, kind)}${quote}`;
      });

  let out = '';
  let last = 0;
  for (const m of markdown.matchAll(CODE)) {
    out += rewriteText(markdown.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  return out + rewriteText(markdown.slice(last));
}

/** Drop a leading `# Title` H1 when it repeats the title (or the repo name). */
export function stripDuplicateH1(body, ...titles) {
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const wanted = new Set(titles.map(norm).filter(Boolean));
  return body.replace(/^\s*#[ \t]+(.+?)[ \t#]*(?:\r?\n|$)/, (line, text) =>
    wanted.has(norm(text.replace(/<[^>]*>/g, ''))) ? '' : line
  ).replace(/^\s+/, '');
}

/** Public, non-fork, non-archived repo carrying the portfolio topic. */
export function isPortfolioRepo(repo, config) {
  return Boolean(
    repo &&
      Array.isArray(repo.topics) &&
      repo.topics.includes(config.topic) &&
      !repo.fork &&
      !repo.archived &&
      !repo.private
  );
}

/**
 * Front matter for a project derived from GitHub repo metadata; `overrides` (front matter of the
 * repo's PORTFOLIO.md) win per field. Returns null if the repo isn't eligible or has no summary.
 */
export function projectMetaFromRepo(repo, overrides = {}, config) {
  if (!isPortfolioRepo(repo, config)) return null;

  const ignored = new Set([config.topic, config.featuredTopic].filter(Boolean));
  const tags = (repo.topics ?? []).filter(t => !ignored.has(t));
  if (repo.language && !tags.some(t => t.toLowerCase() === repo.language.toLowerCase())) {
    tags.push(repo.language);
  }

  const derived = {
    title: humanize(repo.name),
    summary: repo.description?.trim() || undefined,
    date: toIsoDate(repo.created_at),
    tags,
    featured: Boolean(config.featuredTopic && repo.topics.includes(config.featuredTopic)),
    repo: repo.html_url,
    demo: repo.homepage?.trim() || undefined,
    stars: repo.stargazers_count ?? 0
  };

  const meta = { ...derived, ...overrides };
  if (meta.date !== undefined) meta.date = toIsoDate(meta.date);
  if (!meta.summary || String(meta.summary).trim() === '') return null;

  for (const key of Object.keys(meta)) {
    if (meta[key] === undefined) delete meta[key];
  }
  return meta;
}

/** Convert Date values to YYYY-MM-DD and drop undefined so matter.stringify emits clean YAML. */
export function cleanFrontMatter(data) {
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    out[key] = value instanceof Date ? toIsoDate(value) : value;
  }
  return out;
}

/** Patterns for GitHub credentials; used to make sure nothing token-like is ever written to public/. */
export const TOKEN_PATTERN = /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/;
