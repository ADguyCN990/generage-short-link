# 短链接服务

这是一个基于 Cloudflare Workers 和 KV 存储构建的高性能短链接服务。它包含一个用于生成短链接的后端 API 和一个简洁的前端页面。

## ✨ 功能特性 (Features)

- **高性能**: 利用 Cloudflare 的全球边缘网络，实现快速的链接重定向和创建。
- **无服务器架构**: 后端由 Cloudflare Workers 驱动，无需管理传统服务器。
- **高可用性**: 依赖于 Cloudflare KV，一个全球分布式的键值存储。
- **简单易用**: 提供一个直观的前端界面，方便用户快速生成短链接。
- **自定义短码**: 自动生成6位随机字母数字组合作为短链接路径。
- **CORS 支持**: 后端 API 支持跨域请求。

## 🛠️ 技术栈 (Tech Stack)

- **后端**:
  - [Cloudflare Workers](https://workers.cloudflare.com/): 用于处理 API 请求和重定向逻辑的无服务器计算平台。
  - [Cloudflare KV](https://developers.cloudflare.com/workers/learning/how-kv-works/): 用于存储长链接和短链接映射的分布式键值数据库。
  - [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript): 后端逻辑的主要编程语言。
  - [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/): 用于开发、测试和部署 Cloudflare Workers 的命令行工具。

- **前端**:
  - [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
  - [Bootstrap 5](https://getbootstrap.com/): 用于快速构建响应式前端页面的 CSS 框架。
  - [Vanilla JavaScript](http://vanilla-js.com/): 用于处理前端交互和 API 请求。

## 📂 项目结构 (Project Structure)

```
.
├── .github/                # GitHub Actions CI/CD 配置
│   └── workflows/
│       ├── deploy-backend.yml
│       └── deploy-frontend.yml
├── backend/                # 后端 Cloudflare Worker 项目
│   ├── src/
│   │   └── index.js        # Worker 的核心逻辑
│   └── wrangler.toml       # Worker 的配置文件
└── frontend/               # 前端静态页面
    └── index.html          # 用户操作界面
```

## 🚀 部署指南 (Deployment Guide)

### 先决条件

1.  拥有一个 [Cloudflare](https://www.cloudflare.com/) 账户。
2.  安装 [Node.js](https://nodejs.org/) 和 npm。
3.  全局安装 Cloudflare 的 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/):
    ```bash
    npm install -g wrangler
    ```
4.  登录到您的 Cloudflare 账户:
    ```bash
    wrangler login
    ```

### 部署后端

1.  **创建 KV 命名空间**:
    在 Cloudflare 仪表盘或通过命令行创建一个 KV 命名空间，并获取其 `id`。
    ```bash
    wrangler kv:namespace create "LINKS_KV"
    ```

2.  **配置 `wrangler.toml`**:
    打开 `backend/wrangler.toml` 文件，将其中的 `name` 和 `kv_namespaces` 配置更新为您自己的信息。
    ```toml
    name = "your-worker-name" # 你的 Worker 名称
    main = "src/index.js"
    compatibility_date = "2025-06-24"

    [[kv_namespaces]]
    binding = "LINKS_KV"
    id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" # 替换为你的 KV id
    preview_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" # 替换为你的 KV preview_id
    ```

3.  **部署 Worker**:
    在 `backend` 目录下运行部署命令：
    ```bash
    cd backend
    wrangler deploy
    ```
    部署成功后，您将获得一个 Worker 的 URL (例如 `https://your-worker-name.your-subdomain.workers.dev`)。

### 部署前端

1.  **更新 API 地址**:
    打开 `frontend/index.html`，找到以下行，并将其中的 URL 替换为您刚刚部署的后端 Worker 地址。
    ```javascript
    const backendApiUrl = 'https://your-worker-name.your-subdomain.workers.dev/api/create/shortlink';
    ```

2.  **部署到 Cloudflare Pages**:
    -   在 Cloudflare 仪表盘中，转到 **Pages** > **创建项目** > **直接上传**。
    -   将 `frontend` 文件夹拖放到上传区域。
    -   部署完成后，您将获得一个前端页面的 URL。

### (可选) 配置自定义域名

您可以为前端和后端分别配置自定义域名，以获得更专业的体验。

-   **后端**: 在 Cloudflare 仪表盘的 Worker 设置中，添加一个路由 (例如 `go.yourdomain.com/*`) 指向您的 Worker。
-   **前端**: 在 Cloudflare Pages 的设置中，添加一个自定义域名 (例如 `links.yourdomain.com`)。

## 🤖 CI/CD (持续集成/持续部署)

项目包含 `.github/workflows` 目录，其中定义了使用 GitHub Actions 自动部署前后端的流程。您需要将 Cloudflare API 令牌和账户 ID 配置为 GitHub Secrets (`CF_API_TOKEN`, `CF_ACCOUNT_ID`) 以启用此功能。
