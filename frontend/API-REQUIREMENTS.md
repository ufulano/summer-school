# 后端API需求文档

## 概述

本文档详细说明了前端需要后端实现的API接口和功能。后端需要按照这些规范实现相应的接口，确保前端能够正常调用和渲染响应。

## 基础配置

### 服务器配置
- **开发环境端口**: 8091
- **测试环境端口**: 8092  
- **生产环境端口**: 443 (HTTPS)
- **API前缀**: `/ai-agent-station/api/v1`
- **跨域配置**: 需要允许前端域名访问

### 响应格式标准
```json
{
    "code": "0000",           // 成功码，失败时返回其他值
    "info": "操作成功",        // 提示信息
    "data": {},              // 响应数据
    "result": {}             // 流式响应数据
}
```

## API接口列表

### 1. 知识库管理 (RAG)

#### 1.1 获取所有有效知识库列表
- **接口**: `POST /ai/admin/rag/queryAllValidRagOrder`
- **请求头**: `Content-Type: application/json`
- **请求体**: `{}`
- **响应示例**:
```json
{
    "code": "0000",
    "info": "查询成功",
    "data": [
        {
            "id": 1,
            "ragName": "技术文档库",
            "knowledgeTag": "tech",
            "status": 1,
            "createTime": "2024-01-01 10:00:00"
        }
    ]
}
```

#### 1.2 添加知识库
- **接口**: `POST /ai/admin/rag/addRagOrder`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "ragName": "新知识库",
    "knowledgeTag": "new_tag",
    "status": 1
}
```

#### 1.3 更新知识库
- **接口**: `POST /ai/admin/rag/updateRagOrder`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1,
    "ragName": "更新后的知识库",
    "knowledgeTag": "updated_tag",
    "status": 1
}
```

#### 1.4 删除知识库
- **接口**: `POST /ai/admin/rag/deleteRagOrder`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

#### 1.5 获取知识库详情
- **接口**: `POST /ai/admin/rag/queryRagOrderDetail`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

### 2. AI代理管理

#### 2.1 获取AI代理列表
- **接口**: `POST /ai/admin/agent/queryAiAgentList`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "pageNum": 1,
    "pageSize": 10,
    "agentName": ""
}
```

#### 2.2 根据渠道获取AI代理列表
- **接口**: `POST /ai/admin/agent/queryAllAgentConfigListByChannel`
- **请求头**: `Content-Type: application/x-www-form-urlencoded`
- **请求体**: `channel=chat_stream`
- **响应示例**:
```json
{
    "code": "0000",
    "info": "查询成功",
    "data": [
        {
            "id": 1,
            "agentName": "GPT-4助手",
            "model": "gpt-4",
            "status": 1
        }
    ]
}
```

#### 2.3 添加AI代理
- **接口**: `POST /ai/admin/agent/addAiAgent`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "agentName": "新AI代理",
    "model": "gpt-3.5-turbo",
    "status": 1
}
```

#### 2.4 更新AI代理
- **接口**: `POST /ai/admin/agent/updateAiAgent`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1,
    "agentName": "更新后的AI代理",
    "model": "gpt-4",
    "status": 1
}
```

#### 2.5 删除AI代理
- **接口**: `POST /ai/admin/agent/deleteAiAgent`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

#### 2.6 获取AI代理详情
- **接口**: `POST /ai/admin/agent/queryAiAgentDetail`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

### 3. 流式聊天接口

#### 3.1 流式聊天
- **接口**: `GET /ai/agent/chat_stream`
- **请求参数**:
  - `aiAgentId`: AI代理ID
  - `ragId`: 知识库ID (可选，默认为0)
  - `message`: 用户消息
- **响应格式**: Server-Sent Events (SSE)
- **响应头**: `Content-Type: text/event-stream`
- **响应示例**:
```
data: {"result": {"output": {"text": "这是AI的回复内容", "metadata": {"finishReason": "STOP"}}}}

data: {"result": {"output": {"text": "继续回复", "metadata": {"finishReason": "STOP"}}}}
```

### 4. 文件上传管理

#### 4.1 上传文件
- **接口**: `POST /ai/agent/file/upload`
- **请求头**: `Content-Type: multipart/form-data`
- **请求体**:
  - `name`: 知识名称
  - `tag`: 知识标签
  - `files`: 文件列表 (支持多文件)
- **支持文件类型**: .pdf, .csv, .txt, .md, .sql, .java
- **响应示例**:
```json
{
    "code": "0000",
    "info": "上传成功",
    "data": {
        "uploadId": "12345",
        "fileCount": 3
    }
}
```

#### 4.2 删除文件
- **接口**: `POST /ai/agent/file/delete`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "fileId": "12345"
}
```

#### 4.3 获取文件列表
- **接口**: `POST /ai/agent/file/list`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "pageNum": 1,
    "pageSize": 10
}
```

### 5. Git仓库解析

#### 5.1 解析Git仓库
- **接口**: `POST /rag/analyze_git_repository`
- **请求头**: `Content-Type: application/x-www-form-urlencoded`
- **请求体**:
  - `repoUrl`: Git仓库地址
  - `userName`: Git用户名
  - `token`: 访问令牌
- **响应示例**:
```json
{
    "code": "0000",
    "info": "仓库解析成功",
    "data": {
        "repoId": "12345",
        "fileCount": 150,
        "branchCount": 3
    }
}
```

### 6. 系统提示词管理

#### 6.1 获取所有系统提示词
- **接口**: `POST /ai/admin/client/system/prompt/queryAllSystemPromptConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**: `{}`
- **响应示例**:
```json
{
    "code": "0000",
    "info": "查询成功",
    "data": [
        {
            "id": 1,
            "promptName": "代码助手",
            "promptContent": "你是一个专业的代码助手...",
            "status": 1
        }
    ]
}
```

#### 6.2 添加系统提示词
- **接口**: `POST /ai/admin/client/system/prompt/addSystemPromptConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "promptName": "新提示词",
    "promptContent": "提示词内容",
    "status": 1
}
```

#### 6.3 更新系统提示词
- **接口**: `POST /ai/admin/client/system/prompt/updateSystemPromptConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1,
    "promptName": "更新后的提示词",
    "promptContent": "更新后的内容",
    "status": 1
}
```

#### 6.4 删除系统提示词
- **接口**: `POST /ai/admin/client/system/prompt/deleteSystemPromptConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

#### 6.5 获取系统提示词详情
- **接口**: `POST /ai/admin/client/system/prompt/querySystemPromptConfigDetail`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

### 7. 客户端模型配置管理

#### 7.1 获取客户端模型配置列表
- **接口**: `POST /ai/admin/client/model/config/queryClientModelConfigList`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "pageNum": 1,
    "pageSize": 10,
    "clientId": 1
}
```

#### 7.2 添加客户端模型配置
- **接口**: `POST /ai/admin/client/model/config/addClientModelConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "clientId": 1,
    "modelId": 1,
    "modelParams": "{}",
    "status": 1
}
```

#### 7.3 更新客户端模型配置
- **接口**: `POST /ai/admin/client/model/config/updateClientModelConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1,
    "clientId": 1,
    "modelId": 1,
    "modelParams": "{}",
    "status": 1
}
```

#### 7.4 删除客户端模型配置
- **接口**: `POST /ai/admin/client/model/config/deleteClientModelConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

#### 7.5 获取客户端模型配置详情
- **接口**: `POST /ai/admin/client/model/config/queryClientModelConfigDetail`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

### 8. 客户端工具配置管理

#### 8.1 获取客户端工具配置列表
- **接口**: `POST /ai/admin/client/tool/config/queryClientToolConfigList`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "pageNum": 1,
    "pageSize": 10,
    "clientId": 1
}
```

#### 8.2 添加客户端工具配置
- **接口**: `POST /ai/admin/client/tool/config/addClientToolConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "clientId": 1,
    "toolId": 1,
    "toolParams": "{}",
    "status": 1
}
```

#### 8.3 更新客户端工具配置
- **接口**: `POST /ai/admin/client/tool/config/updateClientToolConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1,
    "clientId": 1,
    "toolId": 1,
    "toolParams": "{}",
    "status": 1
}
```

#### 8.4 删除客户端工具配置
- **接口**: `POST /ai/admin/client/tool/config/deleteClientToolConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

#### 8.5 获取客户端工具配置详情
- **接口**: `POST /ai/admin/client/tool/config/queryClientToolConfigDetail`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

### 9. MCP工具管理

#### 9.1 获取MCP工具列表
- **接口**: `POST /ai/admin/client/tool/mcp/queryMcpList`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "pageNum": 1,
    "pageSize": 10,
    "mcpName": ""
}
```

#### 9.2 添加MCP工具
- **接口**: `POST /ai/admin/client/tool/mcp/addMcp`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "mcpName": "新MCP工具",
    "mcpConfig": "{}",
    "status": 1
}
```

#### 9.3 更新MCP工具
- **接口**: `POST /ai/admin/client/tool/mcp/updateMcp`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1,
    "mcpName": "更新后的MCP工具",
    "mcpConfig": "{}",
    "status": 1
}
```

#### 9.4 删除MCP工具
- **接口**: `POST /ai/admin/client/tool/mcp/deleteMcp`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

#### 9.5 获取MCP工具详情
- **接口**: `POST /ai/admin/client/tool/mcp/queryMcpDetail`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

### 10. 客户端顾问配置管理

#### 10.1 获取客户端顾问配置列表
- **接口**: `POST /ai/admin/client/advisor/config/queryClientAdvisorConfigList`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "pageNum": 1,
    "pageSize": 10,
    "clientId": 1
}
```

#### 10.2 添加客户端顾问配置
- **接口**: `POST /ai/admin/client/advisor/config/addClientAdvisorConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "clientId": 1,
    "advisorId": 1,
    "advisorParams": "{}",
    "status": 1
}
```

#### 10.3 更新客户端顾问配置
- **接口**: `POST /ai/admin/client/advisor/config/updateClientAdvisorConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1,
    "clientId": 1,
    "advisorId": 1,
    "advisorParams": "{}",
    "status": 1
}
```

#### 10.4 删除客户端顾问配置
- **接口**: `POST /ai/admin/client/advisor/config/deleteClientAdvisorConfig`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

#### 10.5 获取客户端顾问配置详情
- **接口**: `POST /ai/admin/client/advisor/config/queryClientAdvisorConfigDetail`
- **请求头**: `Content-Type: application/json`
- **请求体**:
```json
{
    "id": 1
}
```

## 重要说明

### 1. 跨域配置
后端需要配置CORS，允许以下域名访问：
- `http://localhost:5500` (开发环境前端)
- `http://localhost:5501` (测试环境前端)
- `https://yourdomain.com` (生产环境前端)

### 2. 流式响应要求
- 流式聊天接口必须支持Server-Sent Events (SSE)
- 响应头必须包含 `Content-Type: text/event-stream`
- 响应头必须包含 `Access-Control-Allow-Origin`
- 数据格式必须为JSON，包含在 `data:` 前缀中

### 3. 文件上传要求
- 支持多文件上传
- 文件大小限制建议为100MB
- 支持的文件类型：.pdf, .csv, .txt, .md, .sql, .java
- 需要返回上传结果和文件ID

### 4. 错误处理
- 所有接口都需要统一的错误响应格式
- HTTP状态码应该正确反映请求结果
- 错误信息应该清晰明确

### 5. 分页查询
- 所有列表查询接口都需要支持分页
- 分页参数：`pageNum` (页码), `pageSize` (每页大小)
- 响应中需要包含总数信息

### 6. 数据验证
- 所有输入参数都需要进行验证
- 必填字段不能为空
- 数据类型需要正确

## 测试建议

1. **单元测试**: 为每个API接口编写单元测试
2. **集成测试**: 测试前后端集成
3. **性能测试**: 测试高并发情况下的性能
4. **安全测试**: 测试接口安全性，防止SQL注入等攻击

## 部署建议

1. **环境配置**: 支持开发、测试、生产环境配置
2. **日志记录**: 记录所有API调用日志
3. **监控告警**: 设置API调用监控和告警
4. **备份策略**: 定期备份数据库和文件

---

**注意**: 本文档中的所有接口都是前端实际需要的，后端需要按照这些规范实现相应的功能。如有疑问，请参考前端代码中的具体调用方式。
