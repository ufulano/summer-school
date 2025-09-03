/**
 * 环境配置管理
 * 支持开发、测试、生产三种环境
 */

class EnvConfig {
    constructor() {
        this.environments = {
            development: {
                name: '开发环境',
                frontendPort: 5500,
                backendPort: 8091,
                backendUrl: 'http://192.168.1.104:8091',
                enableCors: true,
                enableHttps: false,
                logLevel: 'debug'
            },
            test: {
                name: '测试环境',
                frontendPort: 5501,
                backendPort: 8092,
                backendUrl: 'http://test-backend:8092',
                enableCors: true,
                enableHttps: false,
                logLevel: 'info'
            },
            production: {
                name: '生产环境',
                frontendPort: 80,
                backendPort: 443,
                backendUrl: 'https://api.yourdomain.com',
                enableCors: true,
                enableHttps: true,
                logLevel: 'error'
            }
        };
        
        // 从环境变量或默认值获取当前环境
        this.currentEnv = this.getCurrentEnvironment();
    }

    /**
     * 获取当前环境
     */
    getCurrentEnvironment() {
        // 优先从环境变量获取
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
            return process.env.NODE_ENV;
        }
        
        // 从URL参数获取
        const urlParams = new URLSearchParams(window.location.search);
        const envParam = urlParams.get('env');
        if (envParam && this.environments[envParam]) {
            return envParam;
        }
        
        // 从localStorage获取
        const savedEnv = localStorage.getItem('app_environment');
        if (savedEnv && this.environments[savedEnv]) {
            return savedEnv;
        }
        
        // 默认开发环境
        return 'development';
    }

    /**
     * 设置当前环境
     */
    setEnvironment(env) {
        if (!this.environments[env]) {
            throw new Error(`不支持的环境: ${env}`);
        }
        
        this.currentEnv = env;
        localStorage.setItem('app_environment', env);
        
        // 触发环境变更事件
        window.dispatchEvent(new CustomEvent('environmentChanged', {
            detail: { environment: env, config: this.getCurrentConfig() }
        }));
    }

    /**
     * 获取当前环境配置
     */
    getCurrentConfig() {
        return this.environments[this.currentEnv];
    }

    /**
     * 获取指定环境配置
     */
    getConfig(env) {
        if (!this.environments[env]) {
            throw new Error(`不支持的环境: ${env}`);
        }
        return this.environments[env];
    }

    /**
     * 获取所有可用环境
     */
    getAvailableEnvironments() {
        return Object.keys(this.environments);
    }

    /**
     * 检查是否为开发环境
     */
    isDevelopment() {
        return this.currentEnv === 'development';
    }

    /**
     * 检查是否为测试环境
     */
    isTest() {
        return this.currentEnv === 'test';
    }

    /**
     * 检查是否为生产环境
     */
    isProduction() {
        return this.currentEnv === 'production';
    }

    /**
     * 获取后端API基础URL
     */
    getBackendUrl() {
        return this.getCurrentConfig().backendUrl;
    }

    /**
     * 获取前端端口
     */
    getFrontendPort() {
        return this.getCurrentConfig().frontendPort;
    }

    /**
     * 获取后端端口
     */
    getBackendPort() {
        return this.getCurrentConfig().backendPort;
    }

    /**
     * 是否启用CORS
     */
    isCorsEnabled() {
        return this.getCurrentConfig().enableCors;
    }

    /**
     * 是否启用HTTPS
     */
    isHttpsEnabled() {
        return this.getCurrentConfig().enableHttps;
    }

    /**
     * 获取日志级别
     */
    getLogLevel() {
        return this.getCurrentConfig().logLevel;
    }

    /**
     * 打印当前配置信息
     */
    printConfig() {
        const config = this.getCurrentConfig();
        console.group(`🌍 当前环境: ${config.name} (${this.currentEnv})`);
        console.log('前端端口:', config.frontendPort);
        console.log('后端端口:', config.backendPort);
        console.log('后端地址:', config.backendUrl);
        console.log('CORS启用:', config.enableCors);
        console.log('HTTPS启用:', config.enableHttps);
        console.log('日志级别:', config.logLevel);
        console.groupEnd();
    }
}

// 创建全局实例
window.EnvConfig = new EnvConfig();

// 页面加载时打印配置信息
document.addEventListener('DOMContentLoaded', () => {
    window.EnvConfig.printConfig();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvConfig;
}
