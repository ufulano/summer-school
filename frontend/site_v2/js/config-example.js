/**
 * 配置文件示例
 * 复制此文件为 config.js 并根据实际环境修改配置
 */

// 示例：开发环境配置
const ApiConfig = {
    // 当前环境
    ENV: 'development', // development, test, production
    
    // 不同环境的配置
    ENVIRONMENTS: {
        development: {
            BASE_URL: 'http://localhost:8091',  // 修改为你的后端地址
            API_PREFIX: '/ai-agent-station/api/v1',
            TIMEOUT: 30000
        },
        test: {
            BASE_URL: 'http://test-server:8091',
            API_PREFIX: '/ai-agent-station/api/v1',
            TIMEOUT: 30000
        },
        production: {
            BASE_URL: 'https://api.yourdomain.com',  // 修改为你的生产环境地址
            API_PREFIX: '/api/v1',
            TIMEOUT: 30000
        }
    },
    
    // 其他配置保持不变...
    // 请参考完整的 config.js 文件
};

// 示例：端口配置
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
            BACKEND_URL: 'http://localhost:8091',  // 修改为你的后端地址
            
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
        
        // 其他环境配置...
    }
};

/**
 * 配置说明：
 * 
 * 1. 修改后端地址：
 *    - 开发环境：将 BASE_URL 改为你的后端服务器地址
 *    - 生产环境：将 BASE_URL 改为你的生产环境域名
 * 
 * 2. 修改端口：
 *    - 如果后端使用不同端口，修改 BACKEND_PORT
 *    - 如果前端使用不同端口，修改 FRONTEND_PORT
 * 
 * 3. 修改API前缀：
 *    - 如果后端API路径不同，修改 API_PREFIX
 * 
 * 4. 环境切换：
 *    - 在浏览器控制台运行：ApiConfig.setEnvironment('production')
 *    - 或直接修改 ENV 和 CURRENT_ENV 的值
 * 
 * 5. 启动命令：
 *    - 开发环境：python -m http.server 5500 --directory "frontend/site_v2"
 *    - 测试环境：python -m http.server 5501 --directory "frontend/site_v2"
 *    - 生产环境：使用 Nginx 或其他 Web 服务器
 */
