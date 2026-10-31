# Evinci · 有结构的好奇心

**Understand complexity. Act simply.**

基于 [Evinci 个人视觉体系](https://github.com/EEvinci/personal-visual-identity) 的多页面个人博客框架。使用咖啡棕、奶茶、米白、雾霾蓝，沿用已确认的 Cormorant 标题、霞鹜文楷手写批注与 Q 版形象。

当前版本仅建立框架，**没有公开文章、示例文章或自动导入的 Obsidian 笔记**。

## 页面结构

- `/`：个人形象、简介、个人标签、思考方式、文章入口；紧凑的个人首页。
- `/posts/`：独立的文章目录。
- `/topics/<领域>/`：六个领域的文章空间与二级主题索引，当前为空。
- `/posts/<文章名>/`：以后发布文章时自动生成的阅读页面模板。

没有独立关于页、明暗主题切换或搜索控件。文章页保留适合深度内容的目录、公式、代码高亮与参考链接。

分类镜像自 Praxian 根目录《标签库.md》v1（2026-10-31），见 `src/lib/topics.ts`；只复用了领域与主题名称，没有复制笔记。今后词表调整后手动更新配置。

## 本地预览

Node.js 24 LTS。

```bash
npm ci
npm run dev
```

正式构建与检查：

```bash
npm run check
npm run build
npm run verify
npm run preview
```

尚无文章时，Astro 的空集合警告是预期行为，页面会正常生成。添加第一篇文章后消失。

## 以后填充文章

```bash
npm run new:post -- my-first-note "文章标题"
```

编辑生成的 Markdown，填写 `areas`、两级 `tags`、摘要与正文，定稿后将 `draft` 改为 `false`。未定稿的私人笔记不应提交到公开源码仓库。

详见 [发布说明](docs/publishing.md) 和 [托管、域名说明](docs/hosting.md)。

## 主要文件

| 路径 | 用途 |
| --- | --- |
| `src/pages/index.astro` | 个人首页 |
| `src/pages/posts/index.astro` | 文章目录 |
| `src/pages/topics/[id].astro` | 分类页模板 |
| `src/pages/posts/[...id].astro` | 文章阅读模板 |
| `src/content/posts/` | 以后要公开的文章，当前为空 |
| `src/lib/topics.ts` | Praxian 两级分类词表 |
| `src/assets/character.png` | 个人视觉体系已确认的角色切图 |
| `src/styles/global.css` | 配色、排版和多端布局 |
| `public/fonts/` | 个人视觉字体子集及 OFL 许可 |
| `legacy/hexo/` | 旧 Hexo 脚手架存档，不参与构建 |

Astro 生成静态 HTML，可托管到 GitHub Pages 或其他静态平台，支持后续绑定自有域名。文章和个人形象保留其作者权利，字体与依赖遵循各自开源许可。
