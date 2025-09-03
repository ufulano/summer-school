#!/usr/bin/env node

/**
 * 部署脚本
 * 支持多种部署方式
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// 部署配置
const deployConfigs = {
    local: {
        name: '本地部署',
        description: '部署到本地目录',
        targetDir: './deploy'
    },
    nginx: {
        name: 'Nginx部署',
        description: '部署到Nginx服务器',
        targetDir: '/var/www/html'
    },
    docker: {
        name: 'Docker部署',
        description: '构建Docker镜像',
        dockerfile: 'Dockerfile'
    }
};

async function deploy() {
    try {
        const deployType = process.argv[2] || 'local';
        const config = deployConfigs[deployType];
        
        if (!config) {
            logError(`不支持的部署类型: ${deployType}`);
            showHelp();
            process.exit(1);
        }
        
        log(`🚀 开始 ${config.name}`, 'bright');
        log(`描述: ${config.description}`, 'blue');
        
        // 步骤1: 构建项目
        await buildProject();
        
        // 步骤2: 执行部署
        switch (deployType) {
            case 'local':
                await deployLocal(config);
                break;
            case 'nginx':
                await deployNginx(config);
                break;
            case 'docker':
                await deployDocker(config);
                break;
        }
        
        logSuccess('部署完成！');
        
    } catch (error) {
        logError(`部署失败: ${error.message}`);
        process.exit(1);
    }
}

async function buildProject() {
    logStep('1/3', '构建项目');
    
    try {
        execSync('npm run build:prod', { stdio: 'inherit' });
        logSuccess('项目构建完成');
    } catch (error) {
        throw new Error('项目构建失败');
    }
}

async function deployLocal(config) {
    logStep('2/3', '部署到本地目录');
    
    const sourceDir = path.join(__dirname, '..', 'dist');
    const targetDir = path.resolve(config.targetDir);
    
    if (!fs.existsSync(sourceDir)) {
        throw new Error('构建目录不存在，请先运行构建');
    }
    
    // 创建目标目录
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        logSuccess(`创建目标目录: ${targetDir}`);
    }
    
    // 复制文件
    copyDirectory(sourceDir, targetDir);
    logSuccess(`文件已复制到: ${targetDir}`);
    
    // 生成部署信息
    const deployInfo = {
        deployTime: new Date().toISOString(),
        deployType: 'local',
        sourceDir: sourceDir,
        targetDir: targetDir,
        version: require('../package.json').version
    };
    
    const deployInfoPath = path.join(targetDir, 'deploy-info.json');
    fs.writeFileSync(deployInfoPath, JSON.stringify(deployInfo, null, 2));
    
    logStep('3/3', '生成部署信息');
    logSuccess('本地部署完成');
}

async function deployNginx(config) {
    logStep('2/3', '部署到Nginx');
    
    const sourceDir = path.join(__dirname, '..', 'dist');
    const targetDir = config.targetDir;
    
    if (!fs.existsSync(sourceDir)) {
        throw new Error('构建目录不存在，请先运行构建');
    }
    
    // 检查目标目录权限
    try {
        fs.accessSync(targetDir, fs.constants.W_OK);
    } catch (error) {
        logWarning(`目标目录不可写: ${targetDir}`);
        logInfo('请确保有足够的权限或使用sudo运行');
    }
    
    // 复制文件
    copyDirectory(sourceDir, targetDir);
    logSuccess(`文件已复制到: ${targetDir}`);
    
    // 重启Nginx（如果可能）
    try {
        execSync('sudo systemctl reload nginx', { stdio: 'inherit' });
        logSuccess('Nginx已重新加载');
    } catch (error) {
        logWarning('无法重新加载Nginx，请手动重启');
    }
    
    logStep('3/3', '完成Nginx部署');
    logSuccess('Nginx部署完成');
}

async function deployDocker(config) {
    logStep('2/3', '构建Docker镜像');
    
    const dockerfilePath = path.join(__dirname, '..', config.dockerfile);
    
    if (!fs.existsSync(dockerfilePath)) {
        // 创建默认Dockerfile
        createDefaultDockerfile(dockerfilePath);
        logSuccess('已创建默认Dockerfile');
    }
    
    try {
        const imageName = 'intelligent-document-platform-frontend';
        const tag = require('../package.json').version;
        
        execSync(`docker build -t ${imageName}:${tag} .`, { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        logSuccess(`Docker镜像构建完成: ${imageName}:${tag}`);
        
        // 运行容器
        execSync(`docker run -d -p 80:80 --name idp-frontend ${imageName}:${tag}`, { 
            stdio: 'inherit' 
        });
        
        logSuccess('Docker容器已启动');
        
    } catch (error) {
        throw new Error('Docker构建失败');
    }
    
    logStep('3/3', '完成Docker部署');
    logSuccess('Docker部署完成');
}

function copyDirectory(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }
    
    const items = fs.readdirSync(source);
    for (const item of items) {
        const sourcePath = path.join(source, item);
        const targetPath = path.join(target, item);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            copyDirectory(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
}

function createDefaultDockerfile(dockerfilePath) {
    const dockerfileContent = `# 智能文档平台前端 Dockerfile
FROM nginx:alpine

# 复制构建文件到nginx目录
COPY dist/ /usr/share/nginx/html/

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
`;
    
    fs.writeFileSync(dockerfilePath, dockerfileContent);
}

function showHelp() {
    log('智能文档平台前端部署脚本', 'bright');
    log('');
    log('用法:', 'cyan');
    log('  npm run deploy [type]');
    log('');
    log('部署类型:', 'cyan');
    log('  local    本地部署 (默认)');
    log('  nginx    Nginx服务器部署');
    log('  docker   Docker容器部署');
    log('');
    log('示例:', 'cyan');
    log('  npm run deploy');
    log('  npm run deploy local');
    log('  npm run deploy nginx');
    log('  npm run deploy docker');
    log('');
}

// 主程序
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }
    
    deploy();
}

module.exports = { deploy };
