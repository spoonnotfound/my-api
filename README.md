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
