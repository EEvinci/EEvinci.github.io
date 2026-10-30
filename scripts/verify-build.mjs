import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat();
}
const all = await files(root);
const htmlFiles = all.filter(file => file.endsWith('.html'));
const exists = async file => { try { return (await stat(file)).isFile(); } catch { return false; } };
const htmlCache = new Map(await Promise.all(htmlFiles.map(async file => [file, await readFile(file, 'utf8')])));
let checkedLinks = 0;
for (const [file, html] of htmlCache) {
  assert.match(html, /<title>[^<]+<\/title>/, `Missing title: ${file}`);
  assert.match(html, /rel="canonical"/, `Missing canonical: ${file}`);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `Expected one h1: ${file}`);
  const relative = path.relative(root, file).replaceAll(path.sep, '/').replace(/index\.html$/, '');
  const current = new URL(relative, 'https://eevinci.github.io/');
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const raw = match[1].replaceAll('&amp;', '&');
    const url = new URL(raw, current);
    if (url.origin !== current.origin) continue;
    const decoded = decodeURIComponent(url.pathname);
    let target = path.join(root, decoded);
    if (!await exists(target)) target = path.join(target, 'index.html');
    assert.ok(await exists(target), `Broken local link in ${relative}: ${raw}`);
    if (url.hash && target.endsWith('.html')) {
      const targetHtml = htmlCache.get(target) || await readFile(target, 'utf8');
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok(targetHtml.includes(`id="${id}"`), `Broken anchor in ${relative}: ${raw}`);
    }
    checkedLinks++;
  }
}
for (const required of ['rss.xml', 'search.json', 'sitemap-index.xml', 'sitemap-0.xml', '404.html', 'robots.txt']) assert.ok(await exists(path.join(root, required)), `Missing ${required}`);
const index = JSON.parse(await readFile(path.join(root, 'search.json'), 'utf8'));
for (const entry of index) assert.ok(await exists(path.join(root, 'posts', entry.id, 'index.html')), `Search result has no page: ${entry.id}`);
console.log(`Verified ${htmlFiles.length} HTML pages, ${checkedLinks} internal links/assets/anchors, RSS, sitemap and ${index.length} search entries.`);
