# Evinci · Notes & Explorations

关于 AI、产品构建与教育的个人博客。开源 Astro 构建，GitHub Pages 托管。

**博客：<https://eevinci.github.io/>**

## 本地运行

Node.js 24 LTS（至少 24.19；也可使用 Node 22.23.4+）。

```bash
npm ci
npm run dev
```

## 写一篇文章

```bash
npm run new:post -- my-first-note "我的第一篇笔记"
```

编辑 `src/content/posts/my-first-note.md`，填好摘要、日期、标签与正文。草稿默认 `draft: true`，不会出现在网页、搜索、RSS 和 sitemap 中。定稿后改为 `false`。

```bash
npm run check
npm run build
npm run verify
npm run preview
```

推送到 `main`，GitHub Actions 自动检查、构建和发布。PR 只构建检查，不发布。

**源码仓库是公开的。`draft: true` 只隐藏生成的网站内容；提交到 GitHub 的草稿源码仍可被看到。私人内容应留在自己的 Obsidian 库，不提交到这个仓库。未来日期的文章需在到期后再次触发构建才会发布。**

详细操作见 [从 Obsidian 发布文章](docs/publishing.md)，接域名见 [托管与自定义域名](docs/hosting.md)。

## 功能

- 中文阅读排版、响应式页面、明暗主题（记住选择）
- 正文全文搜索、标签筛选、文章目录、阅读时长
- Markdown、KaTeX 公式、Shiki 代码高亮、表格与图片
- 草稿与未来文章过滤，RSS、sitemap、canonical、文章结构化数据
- 构建后的站内链接、附件与目录锚点检查

## 内容与配置

| 路径 | 用途 |
| --- | --- |
| `src/content/posts/*.md` | 要公开的文章 |
| `public/images/` | 公开文章的图片和附件 |
| `src/lib/posts.ts` | 作者信息、联系方式、文章过滤 |
| `src/pages/about.astro` | 个人介绍（依据 GitHub 自述） |
| `src/styles/global.css` | 视觉风格与阅读样式 |
| `astro.config.mjs` | 站点地址、Markdown、sitemap |
| `.github/workflows/deploy.yml` | GitHub Pages 持续部署 |
| `legacy/hexo/` | 原有 Hexo 脚手架备份，不参与构建 |

网站不依赖付费数据库、CMS 或 Obsidian Publish。生成的 `dist/` 可部署到支持静态文件的托管平台。博客没有自动同步整个笔记库的功能；逐篇整理后发布。

## 内容与依赖

文章与个人媒体保留其作者权利。第三方依赖遵循各自的开源许可证。原有 Hexo 文件保留在 `legacy/hexo/`。
