/// <reference types="node" />
// Build-time only: every route is prerendered to static HTML (GitHub Pages has no server).
// Detail pages get one file per slug, read from the content index that `npm run content`
// generates before the build.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { ContentMeta, ContentType } from './shared/models/content';

async function slugs(type: ContentType): Promise<{ slug: string }[]> {
  const file = join(process.cwd(), 'public', 'content', type, 'index.json');
  const index: ContentMeta[] = JSON.parse(await readFile(file, 'utf8'));
  return index.map(({ slug }) => ({ slug }));
}

export const serverRoutes: ServerRoute[] = [
  { path: 'projects/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: () => slugs('projects') },
  { path: 'writeups/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: () => slugs('writeups') },
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'projects', renderMode: RenderMode.Prerender },
  { path: 'writeups', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  // Anything else (unknown paths) boots the client app from 404.html; see scripts/pages-routes.mjs.
  { path: '**', renderMode: RenderMode.Client }
];
