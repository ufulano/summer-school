# AI智能文档平台 - Vue版本

这是一个基于Vue 3 + Element Plus的现代化AI智能文档平台前端项目。

## 🚀 特性

- **现代化UI设计**: 使用Element Plus组件库，界面美观、交互友好
- **响应式布局**: 支持桌面端和移动端，适配各种屏幕尺寸
- **组件化架构**: 基于Vue 3 Composition API，代码结构清晰
- **路由管理**: 使用Vue Router实现单页应用导航
- **状态管理**: 集成Pinia进行状态管理
- **TypeScript支持**: 完整的类型定义支持

## 📋 功能模块

### 1. 聊天对话 (ChatView)
- AI智能体对话界面
- 支持多种AI模型选择
- 知识库集成
- 对话历史管理
- 实时消息交互

### 2. 文件上传 (UploadView)
- 拖拽上传支持
- 多文件批量上传
- 文件类型验证
- 上传进度显示
- 知识库配置

### 3. Git仓库解析 (GitView)
- 支持GitHub、GitLab、Gitee等平台
- 多种认证方式（Token、SSH）
- 分支选择
- 文件过滤配置
- 解析进度监控

### 4. 管理后台 (AdminView)
- 系统仪表盘
- 知识库管理
- AI智能体配置
- 用户管理
- 系统日志
- 系统设置

## 🛠️ 技术栈

- **前端框架**: Vue 3.3.4
- **UI组件库**: Element Plus 2.3.8
- **路由管理**: Vue Router 4.2.4
- **状态管理**: Pinia 2.1.6
- **构建工具**: Vite 4.4.5
- **图标库**: @element-plus/icons-vue 2.1.0
- **HTTP客户端**: Axios 1.4.0
- **Markdown渲染**: Marked 5.1.1
- **代码高亮**: Highlight.js 11.8.0
- **样式预处理**: Sass 1.64.1

## 📦 安装和运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
cd vue-app
npm install
```

### 开发模式运行
```bash
npm run dev
```
项目将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🏗️ 项目结构

```
vue-app/
├── src/
│   ├── components/          # 公共组件
│   ├── views/              # 页面组件
│   │   ├── ChatView.vue    # 聊天对话页面
│   │   ├── UploadView.vue  # 文件上传页面
│   │   ├── GitView.vue     # Git仓库解析页面
│   │   └── AdminView.vue   # 管理后台页面
│   ├── stores/             # Pinia状态管理
│   ├── utils/              # 工具函数
│   ├── assets/             # 静态资源
│   ├── App.vue             # 根组件
│   ├── main.js             # 应用入口
│   └── router/             # 路由配置
├── public/                 # 公共资源
├── index.html              # HTML模板
├── package.json            # 项目配置
├── vite.config.js          # Vite配置
└── README.md               # 项目说明
```

## 🎨 设计特色

### 视觉设计
- **渐变背景**: 使用现代化的渐变色彩搭配
- **毛玻璃效果**: 半透明背景配合backdrop-filter
- **卡片式布局**: 清晰的信息层次和视觉分组
- **响应式设计**: 适配各种设备和屏幕尺寸

### 交互体验
- **微动画**: 平滑的过渡效果和状态变化
- **即时反馈**: 操作结果的实时反馈
- **智能提示**: 友好的错误提示和操作引导
- **键盘快捷键**: 支持Ctrl+Enter等快捷操作

## 🔧 配置说明

### 开发环境配置
项目默认配置了API代理，将`/api`请求转发到`http://localhost:8000`

### 自定义配置
可以在`vite.config.js`中修改：
- 开发服务器端口
- API代理地址
- 构建输出目录
- 别名配置

## 📱 响应式支持

- **桌面端**: 完整功能展示，多列布局
- **平板端**: 适配中等屏幕，优化触摸操作
- **移动端**: 单列布局，侧边栏可折叠

## 🚀 部署说明

### 静态部署
构建完成后，将`dist`目录部署到任何静态文件服务器

### Docker部署
项目包含Dockerfile，支持容器化部署

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交Issue
- 发送邮件
- 项目讨论区

---

**注意**: 这是一个演示项目，部分功能使用模拟数据。在实际部署时，需要连接真实的后端API服务。

