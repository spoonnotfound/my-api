# AI 模型管理平台

这是一个基于 Next.js 和 TypeScript 的 AI 模型管理平台，提供多种 AI 大模型的统一转发功能。通过兼容 OpenAI 的 API，用户可以方便地访问和管理这些模型。

## 功能特性

- 多模型支持：支持 OpenAI、Claude、OpenRouter 等模型的 API 转发
- API 兼容性：通过 OpenAI 兼容的 API 提供服务
- 本地配置管理：所有模型 API 的相关配置均从本地数据库中读取
- 令牌管理：支持生成和管理访问令牌
- 前端管理界面：提供用户友好的前端界面
- 流式返回：支持 SSE 格式的流式返回

## 技术栈

- Next.js 14
- TypeScript
- Prisma (SQLite)
- Tailwind CSS

## 开发环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn

## 安装步骤

1. 克隆项目并安装依赖：

```bash
git clone <repository-url>
cd my-api
npm install
```

2. 设置环境变量：

创建 `.env` 文件并添加以下配置：

```
DATABASE_URL="file:./dev.db"
```

3. 初始化数据库：

```bash
npx prisma db push
```

4. 启动开发服务器：

```bash
npm run dev
```

访问 http://localhost:3000 即可看到管理界面。

## API 使用方法

1. 在令牌管理页面创建 API 访问令牌
2. 在模型配置页面添加所需的 AI 模型提供商
3. 使用令牌调用 API，注意模型名称格式为 `provider@model_name`

### 普通请求

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "model": "openai@gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### 流式返回

添加 `stream: true` 参数来启用流式返回：

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -N \
  -d '{
    "model": "openai@gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

流式返回将使用 Server-Sent Events (SSE) 格式，每个事件都以 `data: ` 开头，最后以 `data: [DONE]` 结束。

其中 `provider` 是你在模型配置页面添加的提供商名称，`model_name` 是实际的模型名称（如 gpt-4、claude-3-opus-20240229 等）。

## 生产环境部署

1. 构建项目：

```bash
npm run build
```

2. 启动生产服务器：

```bash
npm start
```

## 许可证

MIT

# My-API

一个基于 Next.js 的 API 管理平台。

## 功能特性

- 用户认证和授权
- API 令牌管理
- 模型配置管理
- 支持多种 AI 模型提供商

## 本地开发

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/my-api.git
cd my-api
```

2. 安装依赖：
```bash
npm install
```

3. 复制环境变量文件：
```bash
cp .env.example .env
```

4. 配置环境变量：
- 在 `.env` 文件中填写必要的配置信息

5. 初始化数据库：
```bash
npx prisma migrate dev
```

6. 启动开发服务器：
```bash
npm run dev
```

## Vercel 部署

1. 在 Vercel 中创建新项目并连接到 GitHub 仓库

2. 设置 PostgreSQL 数据库：
   - 在 Vercel 控制台中，进入项目设置
   - 选择 "Storage" 标签
   - 点击 "Connect Database"
   - 选择 "Create New" -> "Postgres"
   - 按照向导完成数据库创建
   - Vercel 会自动添加必要的环境变量

3. 添加其他环境变量：
   - 在项目设置中找到 "Environment Variables" 部分
   - 添加 `JWT_SECRET` 等其他必要的环境变量

4. 部署项目：
   - Vercel 会自动检测代码变更并部署
   - 首次部署时会自动运行数据库迁移

## 环境变量

- `POSTGRES_PRISMA_URL`: PostgreSQL 数据库连接 URL（带连接池）
- `POSTGRES_URL_NON_POOLING`: PostgreSQL 数据库直连 URL
- `JWT_SECRET`: JWT 令牌加密密钥
- `NODE_ENV`: 运行环境（development/production）

## 技术栈

- Next.js 15
- Prisma ORM
- PostgreSQL
- TypeScript
- Tailwind CSS
