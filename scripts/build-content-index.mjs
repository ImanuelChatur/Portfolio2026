import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = 'public/content';
const TYPES = ['projects', 'writeups'];
const REQUIRED = ['title', 'date', 'summary'];

for (const type of TYPES) {
  const dir = path.join(ROOT, type);
  await mkdir(dir, { recursive: true });

  const files = (await readdir(dir)).filter(f => f.endsWith('.md'));
  const items = [];

  for (const file of files) {
    const { data } = matter(await readFile(path.join(dir, file), 'utf8'));
    if (data.draft) continue;

    const missing = REQUIRED.filter(key => !data[key]);
    if (missing.length) {
      throw new Error(`${type}/${file} is missing: ${missing.join(', ')}`);
    }

    items.push({
      ...data,
      slug: file.replace(/\.md$/, ''),
      date: new Date(data.date).toISOString().slice(0, 10),
      tags: data.tags ?? []
    });
  }

  items.sort((a, b) => b.date.localeCompare(a.date));
  await writeFile(path.join(dir, 'index.json'), JSON.stringify(items, null, 2));
  console.log(`content: ${items.length} ${type}`);
}
