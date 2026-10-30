import rss from '@astrojs/rss';
import { publishedPosts, site } from '../lib/posts';
import type { APIContext } from 'astro';
export async function GET(context: APIContext) {
  return rss({
    title: site.title, description: site.description, site: context.site!,
    items: (await publishedPosts()).map(post => ({ title: post.data.title, description: post.data.description, pubDate: post.data.date, link: `/posts/${post.id}/`, categories: post.data.tags })),
    customData: '<language>zh-CN</language>',
  });
}
