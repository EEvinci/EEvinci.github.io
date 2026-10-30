import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const [slug, title = '未命名笔记'] = process.argv.slice(2);
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('用法：npm run new:post -- your-post-slug "文章标题"\n链接名使用小写英文字母、数字和短横线。');
  process.exit(1);
}
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const target = new URL(`../src/content/posts/${slug}.md`, import.meta.url);
const content = `---\ntitle: ${JSON.stringify(title)}\ndescription: "用一两句话说明这篇文章回答什么问题。"\ndate: ${date}\ntags: []\ndraft: true\nfeatured: false\n---\n\n## 问题与背景\n\n\n\n## 我的理解或实践\n\n\n\n## 结论与下一步\n\n\n\n## 参考资料\n\n`;
try {
  await writeFile(target, content, { flag: 'wx' });
  console.log(`已创建草稿：${fileURLToPath(target)}\n定稿后将 draft 改为 false，运行 npm run build && npm run verify 检查。`);
} catch (error) {
  console.error(error.code === 'EEXIST' ? '同名文章已存在，未覆盖。请换一个链接名。' : error.message);
  process.exit(1);
}
