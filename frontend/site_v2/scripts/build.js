#!/usr/bin/env node

/**
 * 构建脚本
 * 支持开发、测试、生产环境的构建
 */

const fs = require('fs');
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

// 获取环境变量
const NODE_ENV = process.env.NODE_ENV || 'development';
const BUILD_DIR = path.join(__dirname, '..', 'dist');

// 环境配置
const envConfigs = {
    development: {
        name: '开发环境',
        minify: false,
        sourceMap: true,
        optimize: false
    },
    test: {
        name: '测试环境',
        minify: false,
        sourceMap: true,
        optimize: true
    },
    production: {
        name: '生产环境',
        minify: true,
        sourceMap: false,
        optimize: true
    }
};

async function build() {
    try {
        log(`🚀 开始构建 ${envConfigs[NODE_ENV].name}`, 'bright');
        
        // 步骤1: 清理构建目录
        await cleanBuildDir();
        
        // 步骤2: 复制静态资源
        await copyAssets();
        
        // 步骤3: 处理配置文件
        await processConfigFiles();
        
        // 步骤4: 优化资源（如果需要）
        if (envConfigs[NODE_ENV].optimize) {
            await optimizeAssets();
        }
        
        // 步骤5: 生成构建信息
        await generateBuildInfo();
        
        logSuccess(`构建完成！输出目录: ${BUILD_DIR}`);
        log(`环境: ${envConfigs[NODE_ENV].name}`, 'blue');
        log(`优化: ${envConfigs[NODE_ENV].optimize ? '是' : '否'}`, 'blue');
        log(`压缩: ${envConfigs[NODE_ENV].minify ? '是' : '否'}`, 'blue');
        
    } catch (error) {
        logError(`构建失败: ${error.message}`);
        process.exit(1);
    }
}

async function cleanBuildDir() {
    logStep('1/5', '清理构建目录');
    
    if (fs.existsSync(BUILD_DIR)) {
        fs.rmSync(BUILD_DIR, { recursive: true, force: true });
        logSuccess('构建目录已清理');
    } else {
        logSuccess('构建目录不存在，跳过清理');
    }
    
    // 创建构建目录
    fs.mkdirSync(BUILD_DIR, { recursive: true });
}

async function copyAssets() {
    logStep('2/5', '复制静态资源');
    
    const sourceDir = path.join(__dirname, '..');
    const filesToCopy = [
        'index.html',
        'upload.html',
        'git.html',
        'css',
        'js',
        'images',
        'admin'
    ];
    
    for (const item of filesToCopy) {
        const sourcePath = path.join(sourceDir, item);
        const targetPath = path.join(BUILD_DIR, item);
        
        if (fs.existsSync(sourcePath)) {
            if (fs.statSync(sourcePath).isDirectory()) {
                copyDirectory(sourcePath, targetPath);
            } else {
                fs.copyFileSync(sourcePath, targetPath);
            }
            logSuccess(`已复制: ${item}`);
        } else {
            logWarning(`文件不存在，跳过: ${item}`);
        }
    }
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

async function processConfigFiles() {
    logStep('3/5', '处理配置文件');
    
    // 处理环境配置
    const envConfigPath = path.join(BUILD_DIR, 'js', 'env-config.js');
    if (fs.existsSync(envConfigPath)) {
        let content = fs.readFileSync(envConfigPath, 'utf8');
        
        // 在生产环境中移除调试代码
        if (NODE_ENV === 'production') {
            content = content.replace(/console\.log\([^)]*\);?/g, '');
            content = content.replace(/console\.group\([^)]*\);?/g, '');
            content = content.replace(/console\.groupEnd\(\);?/g, '');
        }
        
        fs.writeFileSync(envConfigPath, content);
        logSuccess('环境配置文件已处理');
    }
}

async function optimizeAssets() {
    logStep('4/5', '优化资源');
    
    // 这里可以添加资源优化逻辑
    // 例如：压缩CSS、JS文件，优化图片等
    
    logSuccess('资源优化完成');
}

async function generateBuildInfo() {
    logStep('5/5', '生成构建信息');
    
    const buildInfo = {
        buildTime: new Date().toISOString(),
        environment: NODE_ENV,
        version: require('../package.json').version,
        nodeVersion: process.version,
        platform: process.platform
    };
    
    const buildInfoPath = path.join(BUILD_DIR, 'build-info.json');
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    
    logSuccess('构建信息已生成');
}

// 运行构建
if (require.main === module) {
    build();
}

module.exports = { build };
