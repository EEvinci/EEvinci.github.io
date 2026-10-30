# 托管与自定义域名

## 当前方案

使用开源 Astro 生成静态 HTML，由 GitHub Actions 自动构建并发布到 GitHub Pages。

- 网址：`https://eevinci.github.io/`
- 仓库：`https://github.com/EEvinci/EEvinci.github.io`
- Pages 的构建来源为 **GitHub Actions**。
- 主分支更新自动上线；PR 只执行检查。

GitHub Pages 与 Vercel 是托管服务，不是开源博客引擎。本项目的 Astro、Markdown 源文件和静态输出都可迁移，不绑定某一家托管商。GitHub Free 的公开仓库支持 Pages，公开仓库的标准 Actions runner 免费；适合个人静态博客。具体限制以官方文档为准。

## 以后买域名

可以先使用现有免费地址。买好域名后，以 `blog.example.com` 为例：

1. 在 GitHub 账户的 Pages 设置中验证域名，按指引添加 TXT 记录。
2. 仓库 Settings → Pages → Custom domain 填入 `blog.example.com`。
3. 域名商 DNS 添加 CNAME：`blog` → `eevinci.github.io`。不填完整 URL，不加仓库路径。
4. 仓库 Settings → Secrets and variables → Actions → Variables 添加 `SITE_URL=https://blog.example.com`。本地构建可设置同名环境变量；也可以修改 `astro.config.mjs` 的默认地址。
5. 重新运行部署；DNS 与证书生效后启用 Enforce HTTPS。

顶级域名（`example.com`）按 GitHub 官方指引配置 A/AAAA 或 ALIAS/ANAME。当前采用 Actions，CNAME 文件不会替你完成 Pages 域名设置；应在仓库设置中配置。换域名后站内链接路径不变，canonical、RSS、sitemap 根据 SITE_URL 更新。

## 如果迁移到 Vercel

在 Vercel 导入同一个仓库，选择 Astro 静态项目：安装命令 `npm ci`、构建命令 `npm run build`、输出目录 `dist`、Node.js 24，并把 `SITE_URL` 设置为最终域名。不需要服务端适配器或数据库。本次以 GitHub Pages 为正式托管，没有另外创建 Vercel 项目。

## 官方参考

- https://docs.astro.build/en/guides/deploy/github/
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://docs.astro.build/en/guides/deploy/vercel/
