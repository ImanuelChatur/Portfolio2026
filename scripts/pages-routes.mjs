// GitHub Pages post-build step.
// Every route (including each project/writeup slug) is prerendered to <route>/index.html by
// `ng build` (outputMode "static", see src/app/app.routes.server.ts). Any other path falls
// through to 404.html, which is the client-only shell (index.csr.html) so the app still boots
// and the router handles it.
import { copyFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'dist/Portfolio2026/browser';

await copyFile(path.join(OUT, 'index.csr.html'), path.join(OUT, '404.html'));
console.log('pages: 404.html written from index.csr.html');
