// `npm run content [-- --local]`: fetch GitHub content, then build the indexes.
// A runner (rather than `a && b`) so npm's trailing args reach the fetch script on every OS.
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
for (const [script, scriptArgs] of [
  ['scripts/fetch-github-content.mjs', args],
  ['scripts/build-content-index.mjs', []]
]) {
  const { status } = spawnSync(process.execPath, [script, ...scriptArgs], { stdio: 'inherit' });
  if (status !== 0) process.exit(status ?? 1);
}
