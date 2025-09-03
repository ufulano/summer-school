/**
 * 全局配置文件
 * 用于集中管理服务器地址等配置信息
 */
const ApiConfig = {
    // 服务器基础地址
    BASE_URL: 'http://192.168.1.104:8091',
    
    // API路径前缀
    API_PREFIX: '/ai-agent-station/api/v1',
    
    // 获取完整API URL
    getApiUrl: function(path) {
        return this.BASE_URL + this.API_PREFIX + path;
    }
};

// 防止被修改
Object.freeze(ApiConfig);