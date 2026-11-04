import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { sourceHash, validateAnalysis, requestAnalysis, buildGraph, ANALYSIS_VERSION } from './graph-core.mjs';
import { loadPublished } from './extract-graph.mjs';
const post = { id: 'alpha', title: 'Alpha', description: 'A', date: '2020-01-01', body: 'RAG uses retrieval. Evaluation checks the result.' };
const analysis = { concepts: [{ label: 'RAG', evidence: 'RAG uses retrieval.' }] };
const cached = p => ({ sourceHash: sourceHash(p), version: ANALYSIS_VERSION, model: 'deepseek-flash', analysis });

test('only explicit published, nonfuture files are loaded; drafts and missing draft default stay private', async () => {
 const dir = await mkdtemp(path.join(os.tmpdir(), 'evinci-graph-'));
 try {
  for (const [name, flags] of [['published', 'draft: false\ndate: 2020-01-01'], ['private', 'draft: true\ndate: 2020-01-01'], ['implicit', 'date: 2020-01-01'], ['future', 'draft: false\ndate: 2099-01-01']]) await writeFile(path.join(dir, name + '.md'), `---\ntitle: Test\ndescription: Test\n${flags}\n---\nSecret or public content.`);
  assert.deepEqual((await loadPublished(dir, new Date('2026-01-01'))).map(p => p.id), ['published']);
 } finally { await rm(dir, { recursive: true }); }
});
test('evidence is exact and invalid or duplicate concepts fail closed', () => {
 assert.deepEqual(validateAnalysis(analysis, post.body), analysis);
 assert.throws(() => validateAnalysis({ concepts: [{ label: 'RAG', evidence: 'invented evidence' }] }, post.body));
 assert.throws(() => validateAnalysis({ concepts: [...analysis.concepts, ...analysis.concepts] }, post.body));
});
test('model protocol, blank output and truncation are validated without a real API request', async () => {
 let sent;
 const fetchImpl = async (url, options) => { assert.equal(url, 'https://api.deepseek.com/chat/completions'); sent = JSON.parse(options.body); return { ok: true, json: async () => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(analysis) } }] }) }; };
 assert.deepEqual(await requestAnalysis(post, { key: 'test-only', fetchImpl }), analysis);
 assert.equal(sent.response_format.type, 'json_object'); assert.equal(sent.messages[1].content.includes(post.body), true);
 for (const choice of [{ finish_reason: 'stop', message: { content: '   ' } }, { finish_reason: 'length', message: { content: '{}' } }]) await assert.rejects(requestAnalysis(post, { key: 'test-only', fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [choice] }) }) }));
});
test('shared concepts link articles, stale cache does not, removed posts cannot leak back', () => {
 const second = { ...post, id: 'beta', title: 'Beta' };
 const cache = { entries: { alpha: cached(post), beta: cached(second) } };
 const graph = buildGraph([post, second], cache);
 assert.equal(graph.conceptCount, 1); assert.equal(graph.analyzedCount, 2);
 assert.equal(graph.edges.filter(e => e.type === 'shared-concepts').length, 1);
 assert.equal(buildGraph([{ ...post, body: 'Changed article' }], cache).pendingCount, 1);
 assert.equal(buildGraph([post], cache).nodes.some(n => n.id === 'article:beta'), false);
 assert.equal(buildGraph([], cache).nodes.length, 0);
});
