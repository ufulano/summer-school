/**
 * 端口配置文件
 * 用于管理不同环境的端口配置
 */

const PortConfig = {
    // 当前环境
    CURRENT_ENV: 'development',
    
    // 环境配置
    ENVIRONMENTS: {
        development: {
            // 前端端口
            FRONTEND_PORT: 5500,
            FRONTEND_URL: 'http://localhost:5500',
            
            // 后端端口
            BACKEND_PORT: 8091,
            BACKEND_URL: 'http://192.168.1.104:8091',
            
            // API前缀
            API_PREFIX: '/ai-agent-station/api/v1',
            
            // 其他服务端口
            SERVICES: {
                REDIS_PORT: 6379,
                MYSQL_PORT: 3306,
                ELASTICSEARCH_PORT: 9200
            },
            
            // 超时配置
            TIMEOUTS: {
                REQUEST: 30000,
                UPLOAD: 60000,
                STREAM: 300000
            }
        },
        
        test: {
            // 前端端口
            FRONTEND_PORT: 5501,
            FRONTEND_URL: 'http://test-frontend:5501',
            
            // 后端端口
            BACKEND_PORT: 8092,
            BACKEND_URL: 'http://test-backend:8092',
            
            // API前缀
            API_PREFIX: '/ai-agent-station/api/v1',
            
            // 其他服务端口
            SERVICES: {
                REDIS_PORT: 6379,
                MYSQL_PORT: 3306,
                ELASTICSEARCH_PORT: 9200
            },
            
            // 超时配置
            TIMEOUTS: {
                REQUEST: 30000,
                UPLOAD: 60000,
                STREAM: 300000
            }
        },
        
        production: {
            // 前端端口
            FRONTEND_PORT: 80,
            FRONTEND_URL: 'https://yourdomain.com',
            
            // 后端端口
            BACKEND_PORT: 443,
            BACKEND_URL: 'https://api.yourdomain.com',
            
            // API前缀
            API_PREFIX: '/api/v1',
            
            // 其他服务端口
            SERVICES: {
                REDIS_PORT: 6379,
                MYSQL_PORT: 3306,
                ELASTICSEARCH_PORT: 9200
            },
            
            // 超时配置
            TIMEOUTS: {
                REQUEST: 30000,
                UPLOAD: 60000,
                STREAM: 300000
            }
        }
    },
    
    // 获取当前环境配置
    getCurrentConfig: function() {
        return this.ENVIRONMENTS[this.CURRENT_ENV] || this.ENVIRONMENTS.development;
    },
    
    // 设置环境
    setEnvironment: function(env) {
        if (this.ENVIRONMENTS[env]) {
            this.CURRENT_ENV = env;
            console.log(`端口配置环境已切换到: ${env}`);
            return true;
        } else {
            console.error(`不支持的环境: ${env}`);
            return false;
        }
    },
    
    // 获取前端端口
    getFrontendPort: function() {
        return this.getCurrentConfig().FRONTEND_PORT;
    },
    
    // 获取前端URL
    getFrontendUrl: function() {
        return this.getCurrentConfig().FRONTEND_URL;
    },
    
    // 获取后端端口
    getBackendPort: function() {
        return this.getCurrentConfig().BACKEND_PORT;
    },
    
    // 获取后端URL
    getBackendUrl: function() {
        return this.getCurrentConfig().BACKEND_URL;
    },
    
    // 获取API前缀
    getApiPrefix: function() {
        return this.getCurrentConfig().API_PREFIX;
    },
    
    // 获取服务端口
    getServicePort: function(serviceName) {
        const services = this.getCurrentConfig().SERVICES;
        return services[serviceName] || null;
    },
    
    // 获取超时配置
    getTimeout: function(type = 'REQUEST') {
        const timeouts = this.getCurrentConfig().TIMEOUTS;
        return timeouts[type] || timeouts.REQUEST;
    },
    
    // 获取完整的API URL
    getApiUrl: function(path) {
        const config = this.getCurrentConfig();
        return config.BACKEND_URL + config.API_PREFIX + path;
    },
    
    // 端口检查工具
    PortChecker: {
        // 检查端口是否可用
        checkPort: function(port, host = 'localhost') {
            return new Promise((resolve) => {
                const net = require('net');
                const server = net.createServer();
                
                server.listen(port, host, () => {
                    server.once('close', () => {
                        resolve(true);
                    });
                    server.close();
                });
                
                server.on('error', () => {
                    resolve(false);
                });
            });
        },
        
        // 检查多个端口
        checkPorts: async function(ports) {
            const results = {};
            for (const port of ports) {
                results[port] = await this.checkPort(port);
            }
            return results;
        }
    },
    
    // 启动命令生成器
    CommandGenerator: {
        // 生成前端启动命令
        getFrontendCommand: function() {
            const port = PortConfig.getFrontendPort();
            return `python -m http.server ${port} --directory "frontend/site_v2"`;
        },
        
        // 生成后端启动命令
        getBackendCommand: function() {
            const port = PortConfig.getBackendPort();
            return `java -jar your-backend-app.jar --server.port=${port}`;
        },
        
        // 生成Docker启动命令
        getDockerCommand: function() {
            const frontendPort = PortConfig.getFrontendPort();
            const backendPort = PortConfig.getBackendPort();
            return `docker-compose up -d --build`;
        }
    },
    
    // 环境切换工具
    EnvironmentSwitcher: {
        // 切换到开发环境
        switchToDevelopment: function() {
            PortConfig.setEnvironment('development');
            if (typeof ApiConfig !== 'undefined') {
                ApiConfig.setEnvironment('development');
            }
        },
        
        // 切换到测试环境
        switchToTest: function() {
            PortConfig.setEnvironment('test');
            if (typeof ApiConfig !== 'undefined') {
                ApiConfig.setEnvironment('test');
            }
        },
        
        // 切换到生产环境
        switchToProduction: function() {
            PortConfig.setEnvironment('production');
            if (typeof ApiConfig !== 'undefined') {
                ApiConfig.setEnvironment('production');
            }
        }
    },
    
    // 配置验证
    validateConfig: function() {
        const config = this.getCurrentConfig();
        const errors = [];
        
        if (!config.FRONTEND_PORT || config.FRONTEND_PORT < 1 || config.FRONTEND_PORT > 65535) {
            errors.push('前端端口配置无效');
        }
        
        if (!config.BACKEND_PORT || config.BACKEND_PORT < 1 || config.BACKEND_PORT > 65535) {
            errors.push('后端端口配置无效');
        }
        
        if (!config.BACKEND_URL || !config.BACKEND_URL.startsWith('http')) {
            errors.push('后端URL配置无效');
        }
        
        if (errors.length > 0) {
            console.error('配置验证失败:', errors);
            return false;
        }
        
        console.log('配置验证通过');
        return true;
    },
    
    // 获取配置摘要
    getConfigSummary: function() {
        const config = this.getCurrentConfig();
        return {
            environment: this.CURRENT_ENV,
            frontend: {
                port: config.FRONTEND_PORT,
                url: config.FRONTEND_URL
            },
            backend: {
                port: config.BACKEND_PORT,
                url: config.BACKEND_URL
            },
            apiPrefix: config.API_PREFIX,
            timeouts: config.TIMEOUTS
        };
    }
};

// 自动验证配置
PortConfig.validateConfig();

// 防止被修改
Object.freeze(PortConfig);

// 如果在Node.js环境中，导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortConfig;
}
