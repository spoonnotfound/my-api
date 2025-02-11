export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">欢迎使用 My-API 模型管理平台</h1>

        <div>
          <div>
            <p>本服务提供与 OpenAI API 兼容的接口，支持以下端点：</p>
            <ul>
              <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/v1/chat/completions</code> - 聊天完成接口</li>
            </ul>
            <p>使用方法：</p>
            <ol>
              <li>在令牌管理页面创建 API 访问令牌</li>
              <li>在模型配置页面添加所需的 AI 模型提供商</li>
              <li>使用令牌和模型名称调用 API，模型名称格式为 <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">provider@model_name</code></li>
            </ol>
            <h3 className="text-xl font-semibold mt-6 mb-2">普通请求</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <code>{`curl -X POST http://localhost:3000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "model": "openai@gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}</code>
            </pre>

            <h3 className="text-xl font-semibold mt-6 mb-2">流式返回</h3>
            <p>添加 <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">stream: true</code> 参数来启用流式返回：</p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <code>{`curl -X POST http://localhost:3000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -N \\
  -d '{
    "model": "openai@gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'`}</code>
            </pre>
            <p className="mt-4">流式返回将使用 Server-Sent Events (SSE) 格式，每个事件都以 <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">data: </code> 开头，最后以 <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">data: [DONE]</code> 结束。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
