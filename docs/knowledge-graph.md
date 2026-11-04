# 知识图谱与发布解析

图谱只包含 `src/content/posts/` 中 `draft: false` 且发布时间不在未来的 Markdown 文章。分类字段不参与公开导航。文章本身必须已经批准公开；不要把私人笔记复制进源码仓库。

## DeepSeek 配置

在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加 Secret `DEEPSEEK_API_KEY`。不要把密钥写进前端、文章或提交记录。

可选 Actions Variable：`DEEPSEEK_MODEL`，默认 `deepseek-flash`。当前实现使用官方 `https://api.deepseek.com/chat/completions`，非思考模式、JSON Output。服务选择已确定，但实际调用需要用户配置有效密钥及可用额度。

可在 Actions 手动运行时选择 `verify_graph_api`，用一段合成文本做一次真实 JSON 解析连通检查；该输入不会作为文章发布或进入缓存，会产生一次模型调用。默认不重复运行此检查。

本地可在终端安全设置同名环境变量后运行：

```bash
npm run graph:extract
SITE_URL=https://evinci.me npm run build
npm run verify
```

`--require` 会在有待解析文章但缺少密钥时返回失败：`npm run graph:extract -- --require`。

## 数据如何产生

- 分析标题、摘要和正文，只提取核心概念及不超过180字符的连续原文依据。
- 严格验证 JSON、数量、字段长度、重复项与原文依据。空白、截断、错误响应和捏造依据不会进入图谱。
- 根据文章内容摘要哈希、解析版本和模型复用缓存。改写文章后重新解析；删除、转草稿或未来日期的文章不会出现在输出中。
- 缓存位于 `.cache/graph-analysis.json`，不提交 Git；正式发布通过 Actions Cache 保存。PR 不调用模型，也不读取密钥。
- 没有密钥时仍可构建；有文章则显示文章节点及“等待解析”，不会用手写标签假装模型输出。有效密钥下的接口或验证失败会阻止该次发布，避免静默丢失数据。
- 概念名称只做 Unicode、大小写归一。模型可能使用不同同义词，需要人工检查概念命名。共享概念产生的是阅读线索，不代表观点一致、引用或因果。
- 新增/改写公开文章会产生 DeepSeek API 费用；脚本不处理超过150000字符的单篇正文，避免默默截断分析。

访问者浏览静态图谱，不会触发模型调用。界面提供搜索、拖动节点、平移缩放和正文依据；无 JavaScript 时可通过文章列表阅读。

## 参考

- https://api-docs.deepseek.com/guides/json_mode/
- https://api-docs.deepseek.com/api/create-chat-completion/
