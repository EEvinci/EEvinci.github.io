import { readFile } from 'node:fs/promises';
import { publishedPosts } from './posts';
// Shared build-time logic also used by the publishing extractor and its tests.
import { buildGraph } from '../../scripts/graph-core.mjs';
export interface KnowledgeNode { id: string; type: 'article' | 'concept'; label: string; href?: string; description?: string; date?: string; }
export interface KnowledgeEdge { source: string; target: string; type: string; evidence?: string; concepts?: string[]; }
export interface KnowledgeData { nodes: KnowledgeNode[]; edges: KnowledgeEdge[]; articleCount: number; conceptCount: number; analyzedCount: number; pendingCount: number; }
export async function knowledgeGraph(): Promise<KnowledgeData> {
  let cache = { entries: {} };
  try { cache = JSON.parse(await readFile(process.cwd() + '/.cache/graph-analysis.json', 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  return buildGraph((await publishedPosts()).map(post => ({ id: post.id, title: post.data.title, description: post.data.description, date: post.data.date.toISOString(), body: post.body || '' })), cache) as KnowledgeData;
}
