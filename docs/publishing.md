# 之后如何填充文章

当前仅有个人首页、目录、分类空间与文章模板，没有文章内容。网站不会自动同步 Obsidian 笔记。

## 创建文章

```bash
npm run new:post -- understanding-agents "理解智能体：一次实践记录"
```

在 `src/content/posts/understanding-agents.md` 中填写：

```yaml
---
title: "文章标题"
description: "读者看完会理解什么？"
date: 2026-10-31
areas: ["AI与自动化"]
tags: ["AI与自动化/智能体"]
draft: true
---
```

领域和主题取自 Praxian 根目录《标签库.md》，配置在 `src/lib/topics.ts`。`areas` 最多两个；`tags` 用 `一级领域/二级主题` 格式，最多四个。不要把工具、项目或平台名临时添加成一级分类。

文件名决定永久链接，发布后尽量保持稳定。正文用 `##`、`###`，自动生成目录；不要重复写一级标题。

## 从 Obsidian 整理

逐篇选择适合公开的笔记，补充背景、过程、证据与结论。本站使用标准 Markdown：

- 将 Obsidian 双链改为 `[标题](/posts/other-note/)`，确认目标已公开。
- 图片放在 `public/images/your-note/`，正文用 `![说明](/images/your-note/image.png)`。
- Callout 改为普通引用，Dataview 查询与块引用改为可独立阅读的内容。
- Mermaid 当前按代码显示；图形可从 Obsidian 导出为 SVG/PNG 后插入。
- 支持 `$...$` 行内公式、`$$...$$` 独立公式、带语言的代码块、表格与引用。

## 预览与发布

草稿默认不生成网页。预览某篇文章时，仅在本地临时改为 `draft: false`，运行 `npm run dev`。未准备发布时改回 `true`。

`draft: true` 只控制网站输出，不隐藏公开仓库里的源码。私人草稿与个人信息留在自己的库中。

目前 main 需要审核，后续通过文章分支与 PR 发布：

```bash
git switch main
git pull --ff-only
git switch -c codex/my-note
# 整理文章后：
npm run check
npm run build
npm run verify
git add src/content/posts/my-note.md
git commit -s -m "Publish a new note"
git push -u origin codex/my-note
gh pr create --base main --title "发布新笔记" --body "新增整理完成的公开文章。"
```

图片存在时单独暂存相应目录。PR 检查与审核通过并合并后，GitHub Actions 自动部署。

定稿后设置 `draft: false`。文章会出现在文章目录、所属领域页与 RSS。未来日期的文章需到期后再次触发构建才会发布。
