import { getCollection, type CollectionEntry } from 'astro:content';

export const site = {
  name: 'Evinci',
  title: 'Evinci · Notes & Explorations',
  description: '关于 AI、产品构建与教育的学习笔记、实践记录和持续思考。',
  github: 'https://github.com/EEvinci',
  email: 'evinciverciy@gmail.com',
};
export async function publishedPosts() {
  return (await getCollection('posts', ({ data }) => !data.draft && data.date <= new Date()))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function readingTime(post: CollectionEntry<'posts'>) {
  const text = post.body || '';
  const chinese = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const words = (text.replace(/[\u3400-\u9fff]/g, '').match(/\b\w+\b/g) || []).length;
  return Math.max(1, Math.ceil(chinese / 350 + words / 220));
}
