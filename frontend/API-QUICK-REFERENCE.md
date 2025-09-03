# API快速参考

## 核心接口列表

### 1. 聊天相关
```
POST /ai/agent/chat_stream?aiAgentId={id}&ragId={id}&message={msg}
GET  /ai/agent/chat_stream (SSE流式响应)
```

### 2. 知识库管理
```
POST /ai/admin/rag/queryAllValidRagOrder          # 获取知识库列表
POST /ai/admin/rag/addRagOrder                    # 添加知识库
POST /ai/admin/rag/updateRagOrder                 # 更新知识库
POST /ai/admin/rag/deleteRagOrder                 # 删除知识库
```

### 3. AI代理管理
```
POST /ai/admin/agent/queryAllAgentConfigListByChannel  # 获取AI代理列表
POST /ai/admin/agent/addAiAgent                        # 添加AI代理
POST /ai/admin/agent/updateAiAgent                     # 更新AI代理
POST /ai/admin/agent/deleteAiAgent                     # 删除AI代理
```

### 4. 文件上传
```
POST /ai/agent/file/upload  # 上传文件 (multipart/form-data)
```

### 5. Git仓库解析
```
POST /rag/analyze_git_repository  # 解析Git仓库
```

### 6. 系统提示词
```
POST /ai/admin/client/system/prompt/queryAllSystemPromptConfig  # 获取提示词列表
```

## 响应格式
```json
{
    "code": "0000",     // 成功码
    "info": "操作成功",  // 提示信息
    "data": {}          // 响应数据
}
```

## 流式响应格式
```
data: {"result": {"output": {"text": "回复内容", "metadata": {"finishReason": "STOP"}}}}
```

## 跨域配置
需要允许以下域名：
- `http://localhost:5500`
- `http://localhost:5501`
- `https://yourdomain.com`

## 端口配置
- 开发环境: 8091
- 测试环境: 8092
- 生产环境: 443 (HTTPS)
