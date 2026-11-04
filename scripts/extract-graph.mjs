import { readdir, readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parse } from 'yaml';
import { ANALYSIS_VERSION, sourceHash, requestAnalysis } from './graph-core.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const contentRoot = path.join(root, 'src/content/posts');
const cachePath = path.join(root, '.cache/graph-analysis.json');
async function files(dir) { return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat(); }
export async function loadPublished(dir, now = new Date()) {
  const posts = [];
  for (const file of await files(dir)) {
    if (!file.endsWith('.md')) continue;
    const raw = (await readFile(file, 'utf8')).replaceAll('\r\n', '\n');
    const match = raw.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
    if (!match) throw new Error(`Missing frontmatter: ${path.basename(file)}`);
    const data = parse(match[1]); const date = new Date(data.date);
    if (data.draft !== false || Number.isNaN(date.valueOf()) || date > now) continue;
    const id = path.relative(dir, file).replaceAll(path.sep, '/').replace(/\.md$/, '');
    if (!/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(id)) throw new Error('Published article paths must use lowercase slug names');
    if (typeof data.title !== 'string' || typeof data.description !== 'string') throw new Error('Published article needs title and description');
    posts.push({ id, title: data.title, description: data.description, date: date.toISOString(), body: match[2] });
  }
  return posts;
}
async function main() {
  const posts = await loadPublished(contentRoot);
  let cache = { entries: {} };
  try { cache = JSON.parse(await readFile(cachePath, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const key = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-flash';
  if (key) {
    const response = await fetch('https://api.deepseek.com/models', { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`DeepSeek credential check returned HTTP ${response.status}`);
    const available = await response.json();
    if (!available.data?.some(item => item.id === model)) throw new Error('Configured DeepSeek model is not available for this key');
    console.log('DeepSeek authentication and model availability verified.');
    if (process.env.GRAPH_VERIFY_MODEL === 'true') {
      const sample = { title: 'Graph API connectivity check', description: 'Synthetic validation input, not a published article.', body: '检索增强生成（RAG）先检索外部文档，再把文档提供给语言模型。评估用于检查回答是否有原文依据。缓存可以减少对相同内容的重复处理。' };
      const checked = await requestAnalysis(sample, { key, model });
      console.log(`DeepSeek JSON extraction verified: ${checked.concepts.length} evidence-backed concepts. Test input was not published or cached.`);
    }
  }
  const entries = {}; let pending = 0, reused = 0, processed = 0;
  for (const post of posts) {
    const digest = sourceHash(post); const old = cache.entries?.[post.id];
    if (old?.sourceHash === digest && old.version === ANALYSIS_VERSION && old.model === model) { entries[post.id] = old; reused++; continue; }
    if (!key) { pending++; continue; }
    if (post.body.length > 150000) throw new Error('Article too long for a single graph analysis; split or review it before extraction');
    const analysis = await requestAnalysis(post, { key, model });
    entries[post.id] = { sourceHash: digest, version: ANALYSIS_VERSION, model, analysis }; processed++;
  }
  await mkdir(path.dirname(cachePath), { recursive: true });
  await writeFile(cachePath + '.tmp', JSON.stringify({ entries }, null, 2) + '\n');
  await rename(cachePath + '.tmp', cachePath);
  console.log(`Graph analysis: ${posts.length} published, ${reused} cached, ${processed} analyzed, ${pending} pending.`);
  if (pending) { console.warn('DEEPSEEK_API_KEY is missing. Articles remain visible; no keyword relationships are fabricated.'); if (process.argv.includes('--require')) process.exitCode = 1; }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
