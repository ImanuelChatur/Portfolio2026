// Screenshot helper for design QA.
// Usage: node scripts/shoot.mjs <url-or-file> <outDir> [name] [--widths 1440,390] [--themes light,dark] [--full]
// Writes <outDir>/<name>-<width>-<theme>.png. Theme is emulated via prefers-color-scheme
// and also set as data-theme on <html> so pages with a manual toggle follow it.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const full = args.includes('--full');
if (full) args.splice(args.indexOf('--full'), 1);
const widths = flag('widths', '1440,390').split(',').map(Number);
const themes = flag('themes', 'light,dark').split(',');
const [target, outDir, name = 'shot'] = args;
if (!target || !outDir) {
  console.error('Usage: node scripts/shoot.mjs <url-or-file> <outDir> [name] [--widths ..] [--themes ..] [--full]');
  process.exit(1);
}
const url = /^https?:|^file:/.test(target) ? target : pathToFileURL(path.resolve(target)).href;

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch().catch(() => chromium.launch({ channel: "msedge" }));
for (const theme of themes) {
  for (const width of widths) {
    const ctx = await browser.newContext({
      viewport: { width, height: width < 600 ? 844 : 900 },
      colorScheme: theme,
      deviceScaleFactor: 1,
      reducedMotion: 'reduce'
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await page.waitForTimeout(400);
    const file = path.join(outDir, `${name}-${width}-${theme}.png`);
    await page.screenshot({ path: file, fullPage: full });
    console.log(file);
    await ctx.close();
  }
}
await browser.close();
