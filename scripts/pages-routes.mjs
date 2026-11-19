// GitHub Pages post-build step.
// - Copies index.html to <route>/index.html for every static route, so deep links like
//   /Portfolio2026/about return 200 instead of the 404.html fallback (better for SEO and Lighthouse).
// - Copies index.html to 404.html so any other path (e.g. future /writeups/<slug>) still boots the app.
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'dist/Portfolio2026/browser';
const routesSrc = await readFile('src/app/app.routes.ts', 'utf8');

// Static paths from app.routes.ts: `path: 'about'` etc. Skips '', '**' and parameterised paths.
const routes = [...routesSrc.matchAll(/path:\s*'([^']+)'/g)]
  .map(m => m[1])
  .filter(p => p && p !== '**' && !p.includes(':'));

const index = path.join(OUT, 'index.html');
for (const route of routes) {
  await mkdir(path.join(OUT, route), { recursive: true });
  await copyFile(index, path.join(OUT, route, 'index.html'));
}
await copyFile(index, path.join(OUT, '404.html'));
console.log(`pages: index.html copied for ${routes.map(r => '/' + r).join(', ')} and 404.html`);
