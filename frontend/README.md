# 智能文档平台前端（ai-chat/frontend）

- `site_v2`：推荐版本（更现代的样式与交互）

## 一、快速本地预览（推荐使用 site_v2）

在项目根目录使用 Python 启动静态服务器（Windows PowerShell 示例）：

```powershell
python -m http.server 5500 --directory "ai-chat/frontend/site_v2"
```

启动后在浏览器访问：
- 主页：`http://localhost:5500/`
- 上传知识：`http://localhost:5500/upload.html`
- 解析仓库（Git）：`http://localhost:5500/git.html`
- 管理后台：`http://localhost:5500/admin/index.html`

> 说明：日志中的 `GET /favicon.ico 404` 可忽略（未配置站点图标）。

## 二、目录结构（site_v2）

```
site_v2/
├── index.html            # 首页（对话与知识库选择）
├── upload.html           # 上传知识页面
├── git.html              # 解析Git仓库页面
├── admin/                # 管理后台（Bootstrap）
├── css/
│   ├── index.css         # 基础样式（含 Tailwind 辅助类）
│   └── modern.css        # 现代化美化（品牌与视觉加强）
├── js/
│   ├── config.js         # 前端配置（后端 API 基址等）
│   ├── index.js          # 首页主逻辑（聊天、流式渲染等）
│   └── ui-enhancements.js# 交互优化（菜单/侧边栏等）
└── images/               # 站内图片资源
```

## 三、后端 API 配置

### 3.1 配置文件说明

项目包含以下配置文件：

- `js/config.js` - 主要API配置，包含所有API端点定义
- `js/port-config.js` - 端口配置文件，支持多环境切换
- `js/api-client.js` - API客户端工具类，统一处理请求和响应

### 3.2 环境配置

支持三种环境配置：

#### 开发环境 (development)
```javascript
// 默认配置
ApiConfig.ENV = 'development';
PortConfig.CURRENT_ENV = 'development';

// 开发环境设置
- 前端端口: 5500
- 后端端口: 8091
- 后端地址: http://192.168.1.104:8091
```

#### 测试环境 (test)
```javascript
// 切换到测试环境
ApiConfig.setEnvironment('test');
PortConfig.setEnvironment('test');

// 测试环境设置
- 前端端口: 5501
- 后端端口: 8092
- 后端地址: http://test-backend:8092
```

#### 生产环境 (production)
```javascript
// 切换到生产环境
ApiConfig.setEnvironment('production');
PortConfig.setEnvironment('production');

// 生产环境设置
- 前端端口: 80
- 后端端口: 443
- 后端地址: https://api.yourdomain.com
```

### 3.3 快速配置

#### 方法一：修改配置文件
直接编辑 `js/config.js` 中的环境配置：

```javascript
// 修改当前环境
ApiConfig.ENV = 'development'; // 或 'test', 'production'

// 修改后端地址
ApiConfig.ENVIRONMENTS.development.BASE_URL = 'http://your-backend-ip:port';
```

#### 方法二：运行时切换
在浏览器控制台中动态切换：

```javascript
// 切换到开发环境
ApiConfig.setEnvironment('development');
PortConfig.setEnvironment('development');

// 切换到生产环境
ApiConfig.setEnvironment('production');
PortConfig.setEnvironment('production');
```

### 3.4 API端点配置

所有API端点已统一配置在 `ApiConfig.ENDPOINTS` 中：

```javascript
// 使用示例
const ragListUrl = ApiConfig.getEndpointUrl('RAG', 'LIST');
const agentListUrl = ApiConfig.getEndpointUrl('AGENT', 'LIST_BY_CHANNEL');
const uploadUrl = ApiConfig.getEndpointUrl('FILE', 'UPLOAD');
```

### 3.5 启动命令

#### 前端启动
```bash
# 开发环境
python -m http.server 5500 --directory "frontend/site_v2"

# 测试环境
python -m http.server 5501 --directory "frontend/site_v2"

# 生产环境 (使用Nginx等)
nginx -c /path/to/nginx.conf
```

#### 后端启动
```bash
# 开发环境
java -jar your-backend-app.jar --server.port=8091

# 测试环境
java -jar your-backend-app.jar --server.port=8092

# 生产环境
java -jar your-backend-app.jar --server.port=443
```

### 3.6 跨域配置

确保后端服务已开启 CORS（跨域）允许前端域名访问：

```java
// Spring Boot 示例
@CrossOrigin(origins = {"http://localhost:5500", "http://localhost:5501"})
@RestController
public class ApiController {
    // 控制器代码
}
```

### 3.7 流式接口配置

如果你的后端提供了流式 SSE（Server-Sent Events），请确保：
- 流式接口启用 `text/event-stream`
- 浏览器通过 `EventSource` 可直接访问（无需鉴权头或通过 URL 携带必要参数）
- 响应头包含 `Access-Control-Allow-Origin`

### 3.8 API客户端使用

项目提供了统一的API客户端工具类，简化API调用：

#### 基本用法
```javascript
// 获取知识库列表
ApiUtils.getRagList()
    .then(data => {
        console.log('知识库列表:', data);
    })
    .catch(error => {
        console.error('获取失败:', error);
    });

// 获取AI代理列表
ApiUtils.getAgentList('chat_stream')
    .then(data => {
        console.log('AI代理列表:', data);
    });

// 上传文件
const formData = new FormData();
formData.append('file', file);
ApiUtils.uploadFile(formData)
    .then(() => {
        console.log('上传成功');
    });
```

#### 流式聊天
```javascript
// 开始流式聊天
const eventSource = ApiUtils.startChatStream(
    aiAgentId, 
    ragId, 
    message,
    (data) => {
        // 处理消息数据
        console.log('收到消息:', data);
    },
    (error) => {
        // 处理错误
        console.error('连接错误:', error);
    },
    () => {
        // 完成回调
        console.log('聊天完成');
    }
);

// 关闭连接
eventSource.close();
```

#### 自定义请求
```javascript
// 使用API客户端发送自定义请求
apiClient.get('/custom/endpoint', { param: 'value' })
    .then(response => {
        console.log('响应:', response);
    });

// POST请求
apiClient.post('/api/data', { key: 'value' })
    .then(response => {
        console.log('响应:', response);
    });
```

## 四、品牌与文案

- 已将首页标题调整为「智能文档平台」。
- 若需要进一步统一品牌/配色，仅修改 CSS 即可：`css/modern.css`。
- 如需替换其它页面标题（如 upload/git/admin），可在对应 HTML 的 `<title>` 标签中修改。

## 五、常见问题

- 访问空白或报跨域：检查后端 CORS 配置与 `js/config.js` 的 API 地址。
- SSE 无法连接：确认后端是否返回 `text/event-stream` 且网络未被拦截。
- 图标 404：未设置 `favicon.ico`，可忽略或自行在站点根添加图标文件。

## 六、部署建议

- 任意静态服务器（Nginx/Apache/Node 静态服务/Python SimpleHTTPServer）均可部署。
- 确保前端引用的外链（CDN、接口域名）在目标环境可访问。

## 七、后端API需求

### 7.1 API需求文档
详细的后端API需求请参考：
- `API-REQUIREMENTS.md` - 完整的API需求文档
- `API-QUICK-REFERENCE.md` - 快速参考文档

### 7.2 核心要求
1. **端口配置**: 开发环境8091，测试环境8092，生产环境443
2. **跨域支持**: 需要配置CORS允许前端域名访问
3. **流式响应**: 聊天接口需要支持Server-Sent Events (SSE)
4. **文件上传**: 支持多文件上传，文件类型限制
5. **统一响应格式**: 所有接口需要统一的JSON响应格式

### 7.3 接口分类
- **聊天相关**: 流式聊天接口
- **知识库管理**: CRUD操作
- **AI代理管理**: 代理配置管理
- **文件管理**: 文件上传、删除、列表
- **Git集成**: 仓库解析功能
- **系统配置**: 提示词、模型、工具配置

—— 本站点仅为前端静态资源，后端接口需按API需求文档实现。
