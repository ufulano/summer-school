#!/usr/bin/env node

/**
 * 启动脚本
 * 提供更好的开发体验和错误处理
 */

const { spawn } = require('child_process');
const path = require('path');

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

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// 获取环境变量
const NODE_ENV = process.env.NODE_ENV || 'development';

// 环境配置
const envConfigs = {
    development: {
        name: '开发环境',
        port: 5500,
        color: 'green'
    },
    test: {
        name: '测试环境',
        port: 5501,
        color: 'yellow'
    },
    production: {
        name: '生产环境',
        port: 80,
        color: 'red'
    }
};

function startServer() {
    const config = envConfigs[NODE_ENV];
    
    log(`🚀 启动 ${config.name}`, 'bright');
    log(`端口: ${config.port}`, colors[config.color]);
    log(`环境: ${NODE_ENV}`, colors[config.color]);
    
    // 检查端口是否被占用
    checkPort(config.port).then(isAvailable => {
        if (!isAvailable) {
            logError(`端口 ${config.port} 已被占用，尝试使用其他端口...`);
            findAvailablePort(config.port).then(availablePort => {
                startHttpServer(availablePort);
            });
        } else {
            startHttpServer(config.port);
        }
    });
}

function startHttpServer(port) {
    const serverPath = path.join(__dirname, '..');
    
    logInfo(`启动 HTTP 服务器在端口 ${port}`);
    logInfo(`访问地址: http://localhost:${port}`);
    
    const server = spawn('npx', ['http-server', '-p', port.toString(), '-c-1', '.', '--no-dotfiles', '--cors'], {
        cwd: serverPath,
        stdio: 'inherit',
        shell: true
    });
    
    server.on('error', (error) => {
        logError(`服务器启动失败: ${error.message}`);
        process.exit(1);
    });
    
    server.on('close', (code) => {
        if (code !== 0) {
            logError(`服务器异常退出，代码: ${code}`);
        } else {
            logSuccess('服务器已停止');
        }
    });
    
    // 优雅关闭
    process.on('SIGINT', () => {
        logInfo('正在关闭服务器...');
        server.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        logInfo('正在关闭服务器...');
        server.kill('SIGTERM');
    });
}

function checkPort(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(port, () => {
            server.once('close', () => {
                resolve(true);
            });
            server.close();
        });
        
        server.on('error', () => {
            resolve(false);
        });
    });
}

function findAvailablePort(startPort) {
    return new Promise((resolve) => {
        let port = startPort;
        const maxPort = startPort + 100;
        
        function tryPort() {
            if (port > maxPort) {
                logError('无法找到可用端口');
                process.exit(1);
            }
            
            checkPort(port).then(isAvailable => {
                if (isAvailable) {
                    resolve(port);
                } else {
                    port++;
                    tryPort();
                }
            });
        }
        
        tryPort();
    });
}

// 显示帮助信息
function showHelp() {
    log('智能文档平台前端启动脚本', 'bright');
    log('');
    log('用法:', 'cyan');
    log('  npm start              # 启动开发环境');
    log('  npm run start:dev      # 启动开发环境');
    log('  npm run start:test     # 启动测试环境');
    log('  npm run start:prod     # 启动生产环境');
    log('');
    log('环境变量:', 'cyan');
    log('  NODE_ENV=development   # 开发环境 (默认)');
    log('  NODE_ENV=test          # 测试环境');
    log('  NODE_ENV=production    # 生产环境');
    log('');
    log('示例:', 'cyan');
    log('  cross-env NODE_ENV=test npm start');
    log('');
}

// 主程序
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }
    
    startServer();
}

module.exports = { startServer };
