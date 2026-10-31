import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { topics } from './lib/topics';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    areas: z.array(z.string()).max(2).default([]).refine(areas => areas.every(area => topics.some(topic => topic.title === area)), 'areas 必须来自 Praxian 正式领域词表'),
    tags: z.array(z.string()).max(4).default([]).refine(tags => tags.every(tag => topics.some(topic => topic.subjects.some(subject => `${topic.title}/${subject}` === tag))), 'tags 必须使用领域/主题两级标签'),
    draft: z.boolean().default(true),
  }),
});
export const collections = { posts };
