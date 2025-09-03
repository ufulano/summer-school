const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const submitBtn = document.getElementById('submitBtn');
const newChatBtn = document.getElementById('newChatBtn');
const chatList = document.getElementById('chatList');
const welcomeMessage = document.getElementById('welcomeMessage');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const clearAllChatsBtn = document.getElementById('clearAllChatsBtn');
let currentEventSource = null;
let currentChatId = null;

// 通用系统提示消息（错误/警告）- 以更明显的对话气泡样式展示
function showSystemMessage(text, variant = 'error') {
    welcomeMessage.style.display = 'none';
    const wrapper = document.createElement('div');
    wrapper.className = 'max-w-4xl mx-auto mb-4';

    const bubble = document.createElement('div');
    bubble.className = `relative p-4 rounded-xl shadow-md border flex items-start gap-3 ${
        variant === 'error'
            ? 'bg-red-50 border-red-300 text-red-800'
            : 'bg-yellow-50 border-yellow-300 text-yellow-800'
    }`;

    const icon = document.createElement('div');
    icon.className = `w-6 h-6 flex items-center justify-center rounded-full text-white ${
        variant === 'error' ? 'bg-red-500' : 'bg-yellow-500'
    }`;
    icon.textContent = variant === 'error' ? '!' : 'i';

    const content = document.createElement('div');
    content.className = 'whitespace-pre-wrap leading-6';
    content.textContent = text;

    bubble.appendChild(icon);
    bubble.appendChild(content);
    wrapper.appendChild(bubble);
    chatArea.appendChild(wrapper);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// 本地存储工具函数
async function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        return false;
    }
}

async function getStorageItem(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error('Storage error:', error);
        return null;
    }
}

// 获取知识库列表
document.addEventListener('DOMContentLoaded', function() {
    // 获取知识库列表
    const loadRagOptions = () => {
        const ragSelect = document.getElementById('ragSelect');

        ApiUtils.getRagList()
            .then(data => {
                if (data) {
                    // 清空现有选项（保留第一个默认选项）
                    while (ragSelect.options.length > 1) {
                        ragSelect.remove(1);
                    }

                    // 添加新选项
                    data.forEach(item => {
                        const option = new Option(`Rag：${item.ragName}`, item.id);
                        ragSelect.add(option);
                    });
                }
            })
            .catch(error => {
                console.error('获取知识库列表失败:', error);
            });
    };

    // 获取AI代理列表
    function fetchAiAgents() {
        ApiUtils.getAgentList('chat_stream')
            .then(data => {
                const aiAgentSelect = document.getElementById('aiAgent');
                // 清空现有选项
                aiAgentSelect.innerHTML = '';

                // 添加从服务器获取的选项
                if (data && data.length > 0) {
                    data.forEach((agent, index) => {
                        const option = document.createElement('option');
                        option.value = agent.id;
                        option.textContent = agent.agentName;
                        // 如果是第一个选项，设置为选中状态
                        if (index === 0) {
                            option.selected = true;
                        }
                        aiAgentSelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('获取AI代理列表失败:', error);
            });
    }

    // 获取提示词列表
    function fetchPromptTemplates() {
        ApiUtils.getPromptList()
            .then(data => {
                const promptSelect = document.getElementById('promptSelect');
                // 清空现有选项（保留第一个默认选项）
                while (promptSelect.options.length > 1) {
                    promptSelect.remove(1);
                }

                // 添加从服务器获取的选项
                if (data && data.length > 0) {
                    data.forEach(prompt => {
                        const option = document.createElement('option');
                        option.value = prompt.promptContent;
                        option.textContent = prompt.promptName;
                        promptSelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('获取提示词列表失败:', error);
            });
    }

    // 初始化加载
    loadRagOptions();
    // 获取AI代理列表
    fetchAiAgents();
    // 获取提示词列表
    fetchPromptTemplates();

    // 添加提示词选择事件监听
    const promptSelect = document.getElementById('promptSelect');
    promptSelect.addEventListener('change', function() {
        const selectedPrompt = this.value;
        if (selectedPrompt) {
            const messageInput = document.getElementById('messageInput');
            // 如果输入框已有内容，则在内容前添加提示词
            if (messageInput.value.trim()) {
                messageInput.value = selectedPrompt + '\n\n' + messageInput.value;
            } else {
                messageInput.value = selectedPrompt;
            }
            // 重置选择框
            this.value = '';
            // 聚焦到输入框
            messageInput.focus();
        }
    });
});

async function createNewChat() {
    const chatId = Date.now().toString();
    currentChatId = chatId;
    await setStorageItem('currentChatId', chatId);
    await setStorageItem(`chat_${chatId}`, JSON.stringify({
        name: `新聊天 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`,
        messages: []
    }));
    await updateChatList();
    clearChatArea();
    return chatId;
}

function deleteChat(chatId) {
    if (confirm('确定要删除这个聊天记录吗？')) {
        localStorage.removeItem(`chat_${chatId}`); // Remove the chat from localStorage
        if (currentChatId === chatId) { // If the current chat is being deleted
            createNewChat(); // Create a new chat
        }
        updateChatList(); // Update the chat list to reflect changes
    }
}

function updateChatList() {
    chatList.innerHTML = '';
    const chats = Object.keys(localStorage)
      .filter(key => key.startsWith('chat_'));

    const currentChatIndex = chats.findIndex(key => key.split('_')[1] === currentChatId);
    if (currentChatIndex!== -1) {
        const currentChat = chats[currentChatIndex];
        chats.splice(currentChatIndex, 1);
        chats.unshift(currentChat);
    }

    chats.forEach(chatKey => {
        let chatData = JSON.parse(localStorage.getItem(chatKey));
        const chatId = chatKey.split('_')[1];

        // 数据迁移：将旧数组格式转换为新对象格式
        if (Array.isArray(chatData)) {
            chatData = {
                name: `聊天 ${new Date(parseInt(chatId)).toLocaleDateString()}`,
                messages: chatData
            };
            localStorage.setItem(chatKey, JSON.stringify(chatData));
        }

        const li = document.createElement('li');
        li.className = `chat-item flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors ${chatId === currentChatId? 'bg-blue-50' : ''}`;
        li.innerHTML = `
            <div class="flex-1">
                <div class="text-sm font-medium">${chatData.name}</div>
                <div class="text-xs text-gray-400">${new Date(parseInt(chatId)).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
            </div>
            <div class="chat-actions flex items-center gap-1 opacity-0 transition-opacity duration-200">
                <button class="p-1 hover:bg-gray-200 rounded text-gray-500" onclick="renameChat('${chatId}')">重命名</button>
                <button class="p-1 hover:bg-red-200 rounded text-red-500" onclick="deleteChat('${chatId}')">删除</button>
            </div>
        `;
        li.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-actions')) {
                loadChat(chatId);
            }
        });
        li.addEventListener('mouseenter', () => {
            li.querySelector('.chat-actions').classList.remove('opacity-0');
        });
        li.addEventListener('mouseleave', () => {
            li.querySelector('.chat-actions').classList.add('opacity-0');
        });
        chatList.appendChild(li);
    });
}

let currentContextMenu = null;
// 优化后的上下文菜单
function showChatContextMenu(event, chatId) {
    event.stopPropagation();
    closeContextMenu();

    const buttonRect = event.target.closest('button').getBoundingClientRect();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${buttonRect.left}px`;
    menu.style.top = `${buttonRect.bottom + 4}px`;

    menu.innerHTML = `
        <div class="context-menu-item" onclick="renameChat('${chatId}')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            重命名
        </div>
        <div class="context-menu-item text-red-500" onclick="deleteChat('${chatId}')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            删除
        </div>
    `;

    document.body.appendChild(menu);
    currentContextMenu = menu;

    // 点击外部关闭菜单
    setTimeout(() => {
        document.addEventListener('click', closeContextMenu, { once: true });
    });
}

function closeContextMenu() {
    if (currentContextMenu) {
        currentContextMenu.remove();
        currentContextMenu = null;
    }
}

function renameChat(chatId) {
    const chatKey = `chat_${chatId}`;
    const chatData = JSON.parse(localStorage.getItem(chatKey));
    const currentName = chatData.name || `聊天 ${new Date(parseInt(chatId)).toLocaleString()}`;
    let newName = prompt('请输入新的聊天名称', currentName);
    if (newName && newName.length > 10) {
        newName = newName.substring(0, 10);
    }

    if (newName) {
        chatData.name = newName;
        localStorage.setItem(chatKey, JSON.stringify(chatData));
        updateChatList();
    }
}

function loadChat(chatId) {
    currentChatId = chatId;
    localStorage.setItem('currentChatId', chatId);
    clearChatArea();
    const chatData = JSON.parse(localStorage.getItem(`chat_${chatId}`) || { messages: [] });
    chatData.messages.forEach(msg => {
        appendMessage(msg.content, msg.isAssistant, false);
    });
    updateChatList()
}

function clearChatArea() {
    chatArea.innerHTML = '';
    welcomeMessage.style.display = 'flex';
}

function appendMessage(content, isAssistant = false, saveToStorage = true) {
    welcomeMessage.style.display = 'none';
    // 外层：左右对齐容器
    const row = document.createElement('div');
    row.className = `max-w-4xl mx-auto mb-4 flex ${isAssistant ? 'justify-start' : 'justify-end'}`;

    // 气泡
    const bubble = document.createElement('div');
    bubble.className = isAssistant
        ? 'px-4 py-3 rounded-2xl rounded-tl-md bg-gray-100 border border-gray-200 shadow-sm markdown-body relative'
        : 'px-4 py-3 rounded-2xl rounded-tr-md bg-primary-600 text-white shadow-md relative';

    if (isAssistant) {
        bubble.innerHTML = DOMPurify.sanitize(marked.parse(content));
        // 复制按钮（仅AI消息）
        const copyBtn = document.createElement('button');
        copyBtn.className = 'absolute top-2 right-2 p-1 bg-gray-200 rounded-md text-xs';
        copyBtn.textContent = '复制';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(content).then(() => {
                copyBtn.textContent = '已复制';
                setTimeout(() => (copyBtn.textContent = '复制'), 2000);
            });
        };
        bubble.appendChild(copyBtn);
    } else {
        bubble.textContent = content;
    }

    row.appendChild(bubble);
    chatArea.appendChild(row);
    chatArea.scrollTop = chatArea.scrollHeight;

    // 仅在需要时保存到本地存储
    if (saveToStorage && currentChatId) {
        // 确保读取和保存完整的数据结构
        const chatData = JSON.parse(localStorage.getItem(`chat_${currentChatId}`) || '{"name": "新聊天", "messages": []}');
        chatData.messages.push({ content, isAssistant });

        // 如果是用户的第一条消息，将其作为聊天名称
        if (!isAssistant && chatData.messages.length === 1) {
            const nameContent = content.length > 20 ? content.substring(0, 20) + '...' : content;
            chatData.name = nameContent;
        }

        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(chatData));
        updateChatList(); // 更新聊天列表以显示新名称
    }
}

function startEventStream(message) {
    if (currentEventSource) {
        currentEventSource.close();
    }

    // 显示加载指示器
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.classList.remove('hidden');
    submitBtn.disabled = true;

    const ragId = document.getElementById('ragSelect').value;
    // 判断 ragId 为空的时候，设置为0
    const ragIdParam = ragId ? ragId : '0';
    const aiAgentSelect = document.getElementById('aiAgent');
    const aiAgentId = aiAgentSelect.value;
    const aiModelModel = aiAgentSelect.options[aiAgentSelect.selectedIndex].getAttribute('model');

    currentEventSource = ApiUtils.startChatStream(aiAgentId, ragIdParam, message, 
        (data) => {
            // 处理消息
            if (data.result) {
                const output = data.result.output;
                if (output.text) {
                    const newContent = output.text;
                    accumulatedContent += newContent;
                    firstChunkReceived = true;

                    if (spinnerEl) { spinnerEl.remove(); spinnerEl = null; }
                    if (tempBubble) {
                        tempBubble.classList.add('whitespace-pre-wrap');
                        tempBubble.textContent = accumulatedContent;
                    }
                    chatArea.scrollTop = chatArea.scrollHeight;
                }

                if (output.metadata && output.metadata.finishReason === 'STOP') {
                    currentEventSource.close();
                    const finalContent = accumulatedContent;
                    if (tempBubble) {
                        tempBubble.classList.add('markdown-body');
                        tempBubble.innerHTML = DOMPurify.sanitize(marked.parse(finalContent));
                    }

                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'absolute top-2 right-2 p-1 bg-gray-200 rounded-md text-xs';
                    copyBtn.textContent = '复制';
                    copyBtn.onclick = () => {
                        navigator.clipboard.writeText(finalContent).then(() => {
                            copyBtn.textContent = '已复制';
                            setTimeout(() => copyBtn.textContent = '复制', 2000);
                        });
                    };
                    tempBubble && tempBubble.appendChild(copyBtn);

                    if (currentChatId) {
                        const chatData = JSON.parse(localStorage.getItem(`chat_${currentChatId}`) || '{"name": "新聊天", "messages": []}');
                        chatData.messages.push({ content: finalContent, isAssistant: true });
                        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(chatData));
                    }
                    
                    // 隐藏加载指示器
                    loadingSpinner.classList.add('hidden');
                    submitBtn.disabled = false;
                    clearTimeout(timeoutId);
                }
            } else {
                currentEventSource.close();
                // 隐藏加载指示器
                loadingSpinner.classList.add('hidden');
                submitBtn.disabled = false;
                clearTimeout(timeoutId);
                showSystemMessage('服务端返回为空或格式异常。');
            }
        },
        (error) => {
            console.error('EventSource error:', error);
            currentEventSource.close();
            // 发生错误时隐藏加载指示器
            loadingSpinner.classList.add('hidden');
            submitBtn.disabled = false;
            clearTimeout(timeoutId);
            if (tempBubble) {
                if (spinnerEl) spinnerEl.remove();
                tempBubble.classList.add('markdown-body');
                tempBubble.innerHTML = DOMPurify.sanitize(marked.parse('抱歉，连接服务器失败，请稍后重试。'));
            } else {
                showSystemMessage('请求失败：无法连接到服务端，请稍后重试。');
            }
        },
        () => {
            // 完成处理
            console.log('聊天流完成');
        }
    );
    let accumulatedContent = '';
    let tempRow = null; // 行容器
    let tempBubble = null; // 冒泡容器
    let spinnerEl = null; // 加载图标
    let firstChunkReceived = false;
    const CONNECT_TIMEOUT_MS = 10000; // 10s 未收到任何数据则判定失败

    // 先呈现“左侧气泡-加载中”
    (function createLoadingBubble() {
        tempRow = document.createElement('div');
        tempRow.className = 'max-w-4xl mx-auto mb-4 flex justify-start';
        tempBubble = document.createElement('div');
        tempBubble.className = 'px-4 py-3 rounded-2xl rounded-tl-md bg-gray-100 border border-gray-200 shadow-sm relative flex items-center gap-2';
        spinnerEl = document.createElement('div');
        spinnerEl.innerHTML = '<svg class="w-5 h-5 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>';
        const textEl = document.createElement('span');
        textEl.className = 'text-gray-600';
        textEl.textContent = '思考中…';
        tempBubble.appendChild(spinnerEl);
        tempBubble.appendChild(textEl);
        tempRow.appendChild(tempBubble);
        chatArea.appendChild(tempRow);
        chatArea.scrollTop = chatArea.scrollHeight;
    })();

    // 连接超时兜底
    const timeoutId = setTimeout(() => {
        if (!firstChunkReceived) {
            try { currentEventSource && currentEventSource.close(); } catch (e) {}
            loadingSpinner.classList.add('hidden');
            submitBtn.disabled = false;
            if (tempBubble) {
                if (spinnerEl) spinnerEl.remove();
                tempBubble.classList.add('markdown-body');
                tempBubble.innerHTML = DOMPurify.sanitize(marked.parse('抱歉，暂时没有收到服务器响应，请稍后再试。'));
            } else {
                showSystemMessage('连接超时：未收到服务端响应，请检查后端服务或网络。');
            }
        }
    }, CONNECT_TIMEOUT_MS);


}

submitBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (!message) return;

    if (!currentChatId) {
        createNewChat();
    }

    appendMessage(message, false);
    messageInput.value = '';
    startEventStream(message);
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitBtn.click();
    }
});

newChatBtn.addEventListener('click', createNewChat);

toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    updateSidebarIcon();
});

function updateSidebarIcon() {
    const iconPath = document.getElementById('sidebarIconPath');
    if (sidebar.classList.contains('-translate-x-full')) {
        iconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    } else {
        iconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    }
}

// Initialize
updateChatList();
const savedChatId = localStorage.getItem('currentChatId');
if (savedChatId) {
    loadChat(savedChatId);
}

// Handle window resize for responsive design
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('-translate-x-full');
    } else {
        sidebar.classList.add('-translate-x-full');
    }
});

// Initial check for mobile devices
if (window.innerWidth <= 768) {
    sidebar.classList.add('-translate-x-full');
}

updateSidebarIcon();

// 清空所有聊天记录
function clearAllChats() {
    if (confirm('确定要清空所有聊天记录吗？此操作不可恢复！')) {
        // 获取所有聊天记录的key
        const keys = Object.keys(localStorage).filter(key => key.startsWith('chat_'));
        
        // 删除所有聊天记录
        keys.forEach(key => localStorage.removeItem(key));
        
        // 清除当前聊天ID
        localStorage.removeItem('currentChatId');
        currentChatId = null;
        
        // 清空UI
        clearChatArea();
        updateChatList();
        
        // 创建新的空聊天
        createNewChat();
    }
}

// 绑定清空按钮事件
clearAllChatsBtn.addEventListener('click', clearAllChats);

// 上传知识下拉菜单控制
// 获取上传知识按钮和菜单元素
const uploadMenuButton = document.getElementById('uploadMenuButton');
const uploadMenu = document.getElementById('uploadMenu');

// 切换菜单显示
uploadMenuButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadMenu.style.display === 'none' || uploadMenu.style.display === '') {
        uploadMenu.style.display = 'block';
    } else {
        uploadMenu.style.display = 'none';
    }
});

// 点击外部区域关闭菜单
document.addEventListener('click', (e) => {
    if (!uploadMenu.contains(e.target) && e.target !== uploadMenuButton && !uploadMenuButton.contains(e.target)) {
        uploadMenu.style.display = 'none';
    }
});

// 菜单项点击后关闭菜单
document.querySelectorAll('#uploadMenu a').forEach(item => {
    item.addEventListener('click', () => {
        uploadMenu.style.display = 'none';
    });
});
