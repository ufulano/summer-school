# 智能文档平台前端（ai-chat/frontend）

本目录包含两个可直接打开的前端站点版本：
- `site_v1`：早期版本（简单样式）
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

- 修改 `site_v2/js/config.js` 中的后端地址与接口前缀（示例字段名可能为 `ApiConfig.BASE_URL` 或相似常量）。
- 保证浏览器能访问到你的后端服务，并已开启 CORS（跨域）允许此前端域名访问。

如果你的后端提供了流式 SSE（Server-Sent Events），请确保：
- 流式接口启用 `text/event-stream`
- 浏览器通过 `EventSource` 可直接访问（无需鉴权头或通过 URL 携带必要参数）

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

—— 本站点仅为前端静态资源，后端接口需按你的实际服务实现与 `js/config.js` 对齐。
