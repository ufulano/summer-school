我来详细描述这5种UML图的绘制方法和关键要素：

## 1. 类图 - 核心实体、服务和接口关系

### 主要类层次结构：

**实体层 (Entity)**
```
AiAgent (智能体)
├── id: Long
├── agentName: String  
├── agentDesc: String
└── status: Integer

AiClientModel (客户端模型)
├── id: Long
├── modelName: String
├── baseUrl: String
├── apiKey: String
└── modelType: String

AiClientToolMcp (MCP工具)
├── id: Long
├── mcpName: String
├── baseUri: String
└── transportConfig: String

AiRagOrder (知识库)
├── id: Long
├── ragName: String
├── knowledgeTag: String
└── status: Integer
```

**服务层 (Service)**
```
IAiAgentService (接口)
├── preheat(Long aiClientId)
├── chatAgent(Long aiAgentId, String message)
├── chatStream(Long aiAgentId, Long ragId, String message)
└── uploadRagFile(String name, String tag, List<MultipartFile> files)

AiAgentChatService (实现)
├── aiAgentChat(Long aiAgentId, String message)
└── aiAgentChatStream(Long aiAgentId, Long ragId, String message)

AiAgentPreheatService (实现)
├── preheat()
└── preheat(Long aiClientId)
```

**工厂层 (Factory)**
```
DefaultArmoryStrategyFactory
├── chatClient(Long clientId): ChatClient
├── chatModel(Long modelId): ChatModel
└── strategyHandler(): StrategyHandler
```

### 关系箭头：
- 实体间：1对多关联
- 服务实现接口：实线三角形
- 依赖注入：虚线箭头
- 聚合关系：空心菱形

## 2. 时序图 - 智能体对话和预热流程

### 预热流程时序：
```
Application -> AiAgentPreheatService -> DefaultArmoryStrategyFactory -> RootNode
RootNode -> AiClientToolMcpNode -> AiClientAdvisorNode -> AiClientModelNode -> AiClientNode
每个节点 -> ApplicationContext (注册Bean)
```

### 对话流程时序：
```
AiAgentController -> AiAgentChatService -> IAgentRepository
AiAgentChatService -> DefaultArmoryStrategyFactory -> ChatClient
ChatClient -> ChatModel -> OpenAI API
ChatClient -> MCP工具 -> 外部服务
```

### 流式对话时序：
```
AiAgentController -> AiAgentChatService -> PgVectorStore (RAG检索)
AiAgentChatService -> ChatModel -> Flux<ChatResponse>
```

## 3. 组件图 - DDD分层架构

### 分层结构：
```
┌─────────────────────────────────────┐
│           Trigger Layer             │  ← 适配层
│  ┌─────────────────────────────┐    │
│  │   AiAgentController         │    │
│  │   AiAdminAgentController    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│           Domain Layer              │  ← 领域层
│  ┌─────────────────────────────┐    │
│  │   IAiAgentService           │    │
│  │   AiAgentChatService        │    │
│  │   AiAgentPreheatService     │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│        Infrastructure Layer         │  ← 基础设施层
│  ┌─────────────────────────────┐    │
│  │   IAgentRepository          │    │
│  │   IAiAgentDao               │    │
│  │   IAiClientModelDao         │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│           Database Layer            │  ← 数据层
│  ┌─────────────────────────────┐    │
│  │   MySQL                     │    │
│  │   PostgreSQL + pgvector     │    │
│  │   Redis                     │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## 4. 活动图 - 策略树执行流程

### 策略树活动流程：
```
开始
  ↓
RootNode (根节点)
  ↓
并行执行数据查询
├── 查询ai_client_model配置
├── 查询ai_client_tool_mcp配置  
├── 查询ai_client_advisor配置
├── 查询ai_client_system_prompt配置
└── 查询ai_client配置
  ↓
AiClientToolMcpNode (MCP工具节点)
├── 创建McpSyncClient对象
├── 注册Bean: "AiClientToolMcp_" + id
└── 传递到下一节点
  ↓
AiClientAdvisorNode (顾问节点)
├── 创建Advisor对象
├── 注册Bean: "AiClientAdvisor_" + id
└── 传递到下一节点
  ↓
AiClientModelNode (模型节点)
├── 创建OpenAiChatModel对象
├── 注册Bean: "AiClientModel_" + id
└── 传递到下一节点
  ↓
AiClientNode (客户端节点)
├── 构建ChatClient对象
├── 注册Bean: "ChatClient_" + id
└── 完成构建
  ↓
结束
```

## 5. 部署图 - Docker容器部署架构

### 容器部署结构：
```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host                              │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Nginx         │  │   Frontend      │  │   Logs      │ │
│  │   Port: 80      │  │   Static Files  │  │   Volume    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           ↓                     ↓                    ↓      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Application Layer                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │ │
│  │  │ai-agent-    │  │mcp-server-  │  │mcp-server-  │    │ │
│  │  │station-app  │  │weixin-app   │  │csdn-app     │    │ │
│  │  │Port: 8091   │  │Port: 8102   │  │Port: 8101   │    │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              ↓                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Environment Layer                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │ │
│  │  │   MySQL     │  │PostgreSQL   │  │   Redis     │    │ │
│  │  │Port: 3306   │  │Port: 5432   │  │Port: 6379   │    │ │
│  │  │Database:    │  │Database:    │  │Cache        │    │ │
│  │  │ai-agent-    │  │ai-rag-      │  │             │    │ │
│  │  │station      │  │knowledge    │  │             │    │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 网络配置：
```
my-network (Docker Network)
├── ai-agent-station-app: 8091
├── mcp-server-weixin-app: 8102  
├── mcp-server-csdn-app: 8101
├── mysql: 3306
├── vector_db (postgresql): 5432
└── redis: 6379
```

### 关键配置：
- **环境变量**: 通过docker-compose-environment-aliyun.yml配置
- **数据持久化**: MySQL、PostgreSQL数据卷挂载
- **日志管理**: 统一日志目录挂载
- **网络隔离**: 自定义bridge网络

## 代码示例 - 核心类关系

```java
// 1. 服务接口定义
public interface IAiAgentService {
    Response<Boolean> preheat(Long aiClientId);
    Response<String> chatAgent(Long aiAgentId, String message);
    Flux<ChatResponse> chatStream(Long aiAgentId, Long ragId, String message);
}

// 2. 服务实现
@Service
public class AiAgentChatService implements IAiAgentChatService {
    @Resource private IAgentRepository repository;
    @Resource private DefaultArmoryStrategyFactory factory;
    
    public String aiAgentChat(Long aiAgentId, String message) {
        List<Long> clientIds = repository.queryAiClientIdsByAiAgentId(aiAgentId);
        for (Long clientId : clientIds) {
            ChatClient chatClient = factory.chatClient(clientId);
            // 执行对话逻辑
        }
    }
}

// 3. 工厂模式
@Service
public class DefaultArmoryStrategyFactory {
    public ChatClient chatClient(Long clientId) {
        return (ChatClient) applicationContext.getBean("ChatClient_" + clientId);
    }
}

// 4. 策略树节点
@Component
public class RootNode extends AbstractArmorySupport {
    @Override
    protected String doApply(AiAgentEngineStarterEntity request, DynamicContext context) {
        // 并行查询配置数据
        // 传递给子节点处理
        return router(request, context);
    }
}
```

这些UML图能完整展示AI Agent Station的架构设计、数据流、部署结构，帮助你理解整个系统的运作机制。