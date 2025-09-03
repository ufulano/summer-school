# npm 使用指南

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm start
# 或
npm run dev
```

### 3. 访问应用
打开浏览器访问：http://localhost:5500

## 常用命令

### 开发相关
```bash
npm start              # 启动开发环境
npm run dev            # 同 npm start
npm run start:dev      # 明确指定开发环境
npm run start:test     # 启动测试环境
npm run start:prod     # 启动生产环境
```

### 构建相关
```bash
npm run build          # 构建项目（开发环境）
npm run build:dev      # 构建开发版本
npm run build:test     # 构建测试版本
npm run build:prod     # 构建生产版本
```

### 部署相关
```bash
npm run deploy         # 本地部署
npm run deploy:local   # 本地部署
npm run deploy:nginx   # Nginx部署
npm run deploy:docker  # Docker部署
```

### 工具命令
```bash
npm run clean          # 清理构建文件
npm run lint           # 代码检查
npm run test           # 运行测试
npm run serve          # 启动服务（同 dev）
npm run preview        # 预览生产版本
```

## 环境配置

### 自动环境检测
系统会自动检测当前环境：
1. 环境变量 `NODE_ENV`
2. URL参数 `?env=development`
3. localStorage中的保存设置
4. 默认开发环境

### 手动切换环境
在浏览器控制台中：
```javascript
// 切换到开发环境
EnvConfig.setEnvironment('development');

// 切换到测试环境
EnvConfig.setEnvironment('test');

// 切换到生产环境
EnvConfig.setEnvironment('production');

// 查看当前配置
EnvConfig.printConfig();
```

## 环境说明

### 开发环境 (development)
- 端口：5500
- 后端：http://192.168.1.104:8091
- 特性：调试信息、热重载、详细日志

### 测试环境 (test)
- 端口：5501
- 后端：http://test-backend:8092
- 特性：测试数据、中等日志级别

### 生产环境 (production)
- 端口：80
- 后端：https://api.yourdomain.com
- 特性：优化构建、最小日志、HTTPS

## 故障排除

### 端口被占用
```bash
# 使用其他端口
npx http-server -p 8080
```

### 权限问题（Windows）
```bash
npm install --no-optional
```

### 清理缓存
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 依赖问题
```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update

# 检查安全漏洞
npm audit
npm audit fix
```

## 项目结构

```
site_v2/
├── package.json          # npm配置
├── package-lock.json     # 依赖锁定
├── scripts/              # 构建和部署脚本
│   ├── build.js         # 构建脚本
│   ├── start.js         # 启动脚本
│   └── deploy.js        # 部署脚本
├── js/
│   ├── env-config.js    # 环境配置
│   └── ...
├── dist/                # 构建输出目录
├── Dockerfile           # Docker配置
└── .dockerignore        # Docker忽略文件
```

## 开发建议

1. **使用版本控制**：提交 `package.json` 和 `package-lock.json`
2. **定期更新依赖**：使用 `npm outdated` 检查
3. **环境隔离**：不同环境使用不同的配置
4. **构建优化**：生产环境使用 `npm run build:prod`
5. **安全考虑**：定期运行 `npm audit`

## 更多信息

- 详细配置请参考 `README.md`
- API配置请参考 `js/config.js`
- 环境配置请参考 `js/env-config.js`
