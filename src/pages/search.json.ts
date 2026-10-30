import { publishedPosts } from '../lib/posts';
export async function GET() {
  const posts = await publishedPosts();
  return Response.json(posts.map(post => ({ id: post.id, text: [post.data.title, post.data.description, ...post.data.tags, post.body || ''].join(' ') })));
}
