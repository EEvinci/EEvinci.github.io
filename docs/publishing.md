# 发布文章

1. 运行 `npm run new:post -- your-post-slug "文章标题"`。
2. 编辑标题、摘要、日期和正文。不需要预先选择分类或标签。
3. 确认全文与引用均可公开，再把 `draft` 改为 `false`。未来日期的文章不会提前展示。
4. 运行 `npm run check`、`SITE_URL=https://evinci.me npm run build`、`npm run verify`。
5. 提交后，GitHub Actions 解析已公开文章的概念，再构建并发布。文章按日期倒序展示。

```yaml
---
title: "文章标题"
description: "这篇文章回答什么问题。"
date: 2026-11-04
draft: true
---
```

`updated` 可选，用于标注修订日期。旧文章的 `areas` / `tags` 字段可保留为历史元数据，但不形成公共分类入口。正文仅应链接到已发布页面，或可核查的外部来源。

`draft: true` 只是排除生成页面，不能保护公开 Git 仓库中的源文件。不要把私人 Obsidian 笔记、密钥或未获授权的资料提交到此仓库。

模型解析与密钥配置见 [知识图谱](knowledge-graph.md)。图谱缓存只用于已公开文章，访问者不会调用模型。
