# 从 Obsidian 发布文章

博客是对外展示的精选内容，Obsidian 是自己的工作空间。先逐篇挑选、补齐背景，再发布。

## 1. 创建草稿

在博客目录运行：

```bash
npm run new:post -- understanding-agents "理解 AI agents：一次实践记录"
```

用 Obsidian 或任意编辑器打开生成的 Markdown 文件，也可以将 `src/content/posts/` 作为单独的写作库。不要把整个私人库复制到这个公开仓库。

## 2. 填写文章信息

```yaml
---
title: "文章标题"
description: "读者看完这篇文章，会理解什么？"
date: 2026-10-30
tags: ["AI", "实践"]
draft: true
featured: false
---
```

- 文件名决定永久链接，如 `understanding-agents.md` 对应 `/posts/understanding-agents/`。发布后尽量不改文件名。
- 用 `##`、`###` 划分正文，页面自动生成目录。正文不再写一级标题。
- `featured: true` 让文章优先出现在首页；首页最多显示四篇，全部文章都在文章页。
- 修订时可加 `updated: 2026-11-01`。

## 3. 处理 Obsidian 语法

本站使用标准 Markdown，不直接解释 Obsidian 插件语法。复制笔记时转换：

| Obsidian 写法 | 博客写法 |
| --- | --- |
| 双链笔记 | `[另一篇笔记](/posts/other-note/)`，确认目标已发布 |
| 嵌入图片 | `![解释图片内容](/images/my-note/image.png)` |
| Callout | 用 `> 提示内容` 标准引用，或普通小标题 |
| Dataview、块引用、Canvas | 改写成可独立阅读的正文、表格或导出图片 |
| Mermaid 代码块 | 当前按代码显示；需要图形时导出 SVG/PNG 后插图 |

图片复制到 `public/images/my-note/`；引用路径为 `/images/my-note/image.png`。尽量用英文文件名，保留必要的出处。不要使用电脑上的绝对路径。

公式和代码可直接使用：

````markdown
行内公式：$E = mc^2$

$$
L = -\sum_i y_i \log p_i
$$

```python
def learn(question):
    return experiment(question)
```
````

## 4. 预览和发布

`draft: true` 的文章不会生成网页，本地开发也不显示。要预览草稿，先仅在本地临时改为 `draft: false`，运行 `npm run dev`。确认暂不发布时改回 `true`。

仓库的 `main` 分支要求 1 位审核者批准。后续更新使用文章分支和 PR，合并后自动上线。开始整理新文章前：

```bash
git switch main
git pull --ff-only
git switch -c codex/my-note
```

完成定稿后执行：

```bash
npm run check
npm run build
npm run verify
git add src/content/posts/my-note.md public/images/my-note
git commit -s -m "Publish a new note"
git push -u origin codex/my-note
gh pr create --base main --title "发布新笔记" --body "新增已整理完成的文章。"
```

文件名和图片目录替换为实际路径；没有图片就省略该目录。只暂存本次确实要公开的文件。PR 的构建检查通过、审核并合并到 `main` 后，会自动发布。部署成功后，文章出现在博客、搜索和 RSS。`draft: true` 不会保护公开仓库里的源码，私人草稿不要提交。

建议第一批选择：一个研究得较深入的问题、一段有实际结果的实践、一次能说明取舍的复盘。每篇写清楚背景、过程、结论与参考资料。
