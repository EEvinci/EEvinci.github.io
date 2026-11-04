# Evinci · 有结构的好奇心

**Understand complexity. Act simply.**

米黄色底的个人博客：用首页展示创作与实践，以文章记录学习和判断，用知识图谱连接文章与概念。

正式域名： https://evinci.me/ 。源码通过 GitHub Actions 构建并发布到 GitHub Pages。

## 三个入口

- `/`：沿用 GitHub 个人主页的艺术字、卡片与互动，向下浏览精选实践；有公开文章时显示直达正文的最新文章。
- `/posts/`：文章按发布时间倒序连续展示，不预设分类；零文章时显示真实空状态。
- `/graph/`：文章与核心概念的视觉图谱，支持搜索、拖动、平移、缩放和正文依据。当前没有公开文章，不展示模拟节点。
- `/posts/<文章名>/`：正文阅读页，支持公式、代码、参考资料和页内目录。

页面外框随窗口展开，正文仍控制行长。旧分类导航已移除，没有自动导入 Obsidian 或私人知识库。

## 本地预览与核对

使用 Node.js 24 LTS。

```bash
npm ci
npm run dev
npm run check
npm run test:graph
npm run graph:extract
SITE_URL=https://evinci.me npm run build
npm run verify
npm run preview
```

零文章时 Astro 空集合警告是预期行为。没有 DeepSeek 密钥时，文章可构建，未解析文章不生成猜测关系。

## 写作与图谱

```bash
npm run new:post -- my-first-note "文章标题"
```

先完成正文和摘要，确认允许公开，再设置 `draft: false`。详见 [文章发布](docs/publishing.md)、[DeepSeek 知识图谱](docs/knowledge-graph.md)、[域名与托管](docs/hosting.md)。

图谱解析只在发布阶段执行，官方 DeepSeek JSON Output 接口提取概念和原文依据；根据内容哈希复用缓存。需要在 GitHub Actions Secrets 中设置 `DEEPSEEK_API_KEY`。密钥不进入前端。

## 主要文件

| 文件 | 用途 |
|---|---|
| `src/pages/index.astro` | 首页与实践介绍 |
| `src/styles/home-reference.css` | GitHub 个人主页原版视觉及博客集成 |
| `src/pages/posts/index.astro` | 时间流文章页 |
| `src/pages/graph.astro` | 图谱及阅读入口 |
| `src/scripts/knowledge-graph.ts` | 图谱交互 |
| `scripts/extract-graph.mjs` | 发布阶段的 DeepSeek 解析 |
| `scripts/graph-core.mjs` | 依据验证与关系生成 |
| `src/content/posts/` | 已批准公开的文章源码 |

`legacy/hexo/` 是历史存档，不参与构建。文章和个人形象保留作者权利，字体与依赖遵循各自许可。
