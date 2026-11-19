import { describe, expect, it } from 'vitest';
import {
  cleanFrontMatter,
  humanize,
  isPortfolioRepo,
  isPublishable,
  parseFrontMatter,
  projectMetaFromRepo,
  resolveRepoPath,
  rewriteRelativeLinks,
  stripDuplicateH1,
  TOKEN_PATTERN
} from './content-transform.mjs';

const CONFIG = { topic: 'portfolio', featuredTopic: 'featured', bodyFile: 'PORTFOLIO.md' };

const repo = (over = {}) => ({
  name: 'port-scanner',
  description: 'A fast TCP port scanner.',
  created_at: '2025-03-04T12:00:00Z',
  topics: ['portfolio', 'networking'],
  language: 'Go',
  fork: false,
  archived: false,
  private: false,
  html_url: 'https://github.com/u/port-scanner',
  homepage: '',
  stargazers_count: 7,
  ...over
});

describe('humanize', () => {
  it('turns kebab, snake and camel case into title case', () => {
    expect(humanize('port-scanner')).toBe('Port Scanner');
    expect(humanize('bonker_banker')).toBe('Bonker Banker');
    expect(humanize('rifttracker')).toBe('Rifttracker');
    expect(humanize('CPUFinalProject')).toBe('CPU Final Project');
  });
});

describe('rewriteRelativeLinks', () => {
  const toAbs = ({ url, kind }) => `ABS(${kind}:${url})`;

  it('rewrites relative images with and without ./', () => {
    expect(rewriteRelativeLinks('![a](img/x.png)', toAbs)).toBe('![a](ABS(image:img/x.png))');
    expect(rewriteRelativeLinks('![a](./img/x.png "t")', toAbs)).toBe('![a](ABS(image:./img/x.png) "t")');
  });

  it('rewrites relative links and HTML img/a', () => {
    expect(rewriteRelativeLinks('[docs](docs/a.md)', toAbs)).toBe('[docs](ABS(link:docs/a.md))');
    expect(rewriteRelativeLinks('<img alt="x" src="shot.png">', toAbs)).toBe('<img alt="x" src="ABS(image:shot.png)">');
    expect(rewriteRelativeLinks("<a href='LICENSE'>l</a>", toAbs)).toBe("<a href='ABS(link:LICENSE)'>l</a>");
  });

  it('handles badge images nested in links', () => {
    expect(rewriteRelativeLinks('[![b](b.svg)](ci.yml)', toAbs)).toBe('[![b](ABS(image:b.svg))](ABS(link:ci.yml))');
  });

  it('leaves absolute URLs, protocol-relative URLs, mailto and anchors untouched', () => {
    const md = '![a](https://x.io/a.png) [b](//cdn.io/b) [m](mailto:a@b.c) [c](#usage) <img src="http://x/y.png">';
    expect(rewriteRelativeLinks(md, toAbs)).toBe(md);
  });

  it('skips code spans and fenced blocks', () => {
    const md = '`![a](x.png)`\n\n```md\n![a](y.png)\n```\n![a](z.png)';
    expect(rewriteRelativeLinks(md, toAbs)).toBe('`![a](x.png)`\n\n```md\n![a](y.png)\n```\n![a](ABS(image:z.png))');
  });

  it('keeps the link when the resolver returns null', () => {
    expect(rewriteRelativeLinks('![a](x.png)', () => null)).toBe('![a](x.png)');
  });
});

describe('resolveRepoPath', () => {
  it('resolves against the file dir and keeps the suffix', () => {
    expect(resolveRepoPath('boxes/lame', './img/a%20b.png#x')).toEqual({ path: 'boxes/lame/img/a b.png', suffix: '#x' });
    expect(resolveRepoPath('docs', '/assets/logo.png')).toEqual({ path: 'assets/logo.png', suffix: '' });
    expect(resolveRepoPath('docs', '../README.md')).toEqual({ path: 'README.md', suffix: '' });
  });

  it('refuses paths that escape the repo', () => {
    expect(resolveRepoPath('', '../secret.png')).toBeNull();
    expect(resolveRepoPath('a', '../../x')).toBeNull();
  });
});

describe('isPublishable', () => {
  const ok = { title: 'HTB Lame', date: new Date('2026-09-15'), summary: 'SMB to root.' };

  it('accepts complete, non-draft front matter', () => {
    expect(isPublishable(ok)).toBe(true);
    expect(isPublishable({ ...ok, draft: false })).toBe(true);
  });

  it('rejects missing fields, empty values, invalid dates and drafts', () => {
    expect(isPublishable({})).toBe(false);
    expect(isPublishable({ title: 'x', date: '2026-01-01' })).toBe(false);
    expect(isPublishable({ ...ok, summary: '  ' })).toBe(false);
    expect(isPublishable({ ...ok, date: 'not a date' })).toBe(false);
    expect(isPublishable({ ...ok, draft: true })).toBe(false);
  });

  it('rejects files without front matter', () => {
    expect(isPublishable(parseFrontMatter('# Rough notes\nno front matter').data)).toBe(false);
  });
});

describe('parseFrontMatter', () => {
  it('refuses JavaScript front matter instead of evaluating it', () => {
    expect(() => parseFrontMatter('---js\n{ title: "x" }\n---\nbody')).toThrow(/not allowed/);
  });
});

describe('projectMetaFromRepo / isPortfolioRepo', () => {
  it('derives fields from the repo', () => {
    expect(projectMetaFromRepo(repo({ topics: ['portfolio', 'featured', 'networking'] }), {}, CONFIG)).toEqual({
      title: 'Port Scanner',
      summary: 'A fast TCP port scanner.',
      date: '2025-03-04',
      tags: ['networking', 'Go'],
      featured: true,
      repo: 'https://github.com/u/port-scanner',
      stars: 7
    });
  });

  it('does not duplicate the language tag and includes the homepage as demo', () => {
    const meta = projectMetaFromRepo(repo({ topics: ['portfolio', 'go'], homepage: 'https://demo.io' }), {}, CONFIG);
    expect(meta.tags).toEqual(['go']);
    expect(meta.demo).toBe('https://demo.io');
    expect(meta.featured).toBe(false);
  });

  it('filters on topic, forks, archived and private repos', () => {
    expect(isPortfolioRepo(repo(), CONFIG)).toBe(true);
    expect(isPortfolioRepo(repo({ topics: ['networking'] }), CONFIG)).toBe(false);
    expect(isPortfolioRepo(repo({ topics: undefined }), CONFIG)).toBe(false);
    expect(isPortfolioRepo(repo({ fork: true }), CONFIG)).toBe(false);
    expect(isPortfolioRepo(repo({ archived: true }), CONFIG)).toBe(false);
    expect(isPortfolioRepo(repo({ private: true }), CONFIG)).toBe(false);
    expect(projectMetaFromRepo(repo({ topics: ['networking'] }), {}, CONFIG)).toBeNull();
  });

  it('lets PORTFOLIO.md front matter override derived fields', () => {
    const meta = projectMetaFromRepo(
      repo(),
      { title: 'PortScan', date: new Date('2024-01-02'), tags: ['Rust'], featured: true, thumbnail: 'x.png' },
      CONFIG
    );
    expect(meta).toMatchObject({ title: 'PortScan', date: '2024-01-02', tags: ['Rust'], featured: true, thumbnail: 'x.png' });
    expect(meta.summary).toBe('A fast TCP port scanner.');
  });

  it('returns null without a description unless an override supplies a summary', () => {
    expect(projectMetaFromRepo(repo({ description: null }), {}, CONFIG)).toBeNull();
    expect(projectMetaFromRepo(repo({ description: '  ' }), {}, CONFIG)).toBeNull();
    expect(projectMetaFromRepo(repo({ description: null }), { summary: 'From PORTFOLIO.md' }, CONFIG).summary).toBe(
      'From PORTFOLIO.md'
    );
  });
});

describe('stripDuplicateH1', () => {
  it('drops a leading H1 matching the title or repo name only', () => {
    expect(stripDuplicateH1('# Port Scanner\n\nText', 'Port Scanner')).toBe('Text');
    expect(stripDuplicateH1('# port-scanner\nText', 'Port Scanner', 'port-scanner')).toBe('Text');
    expect(stripDuplicateH1('# Something else\nText', 'Port Scanner')).toBe('# Something else\nText');
  });
});

describe('cleanFrontMatter / TOKEN_PATTERN', () => {
  it('formats dates and drops undefined', () => {
    expect(cleanFrontMatter({ date: new Date('2026-02-01'), demo: undefined, x: 1 })).toEqual({ date: '2026-02-01', x: 1 });
  });

  it('matches GitHub token shapes', () => {
    expect(TOKEN_PATTERN.test(`ghp_${'a'.repeat(36)}`)).toBe(true);
    expect(TOKEN_PATTERN.test(`github_pat_${'A1_'.repeat(20)}`)).toBe(true);
    expect(TOKEN_PATTERN.test('ghp_short and normal prose')).toBe(false);
  });
});
