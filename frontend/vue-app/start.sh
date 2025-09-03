#!/bin/bash

echo "========================================"
echo "   AI智能文档平台 - Vue版本"
echo "========================================"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查npm是否可用
if ! command -v npm &> /dev/null; then
    echo "错误: npm不可用，请检查Node.js安装"
    exit 1
fi

# 显示版本信息
echo "Node.js版本: $(node --version)"
echo "npm版本: $(npm --version)"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 依赖安装失败"
        exit 1
    fi
    echo "依赖安装完成！"
    echo ""
fi

echo "启动开发服务器..."
echo "项目将在浏览器中自动打开"
echo "地址: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev

