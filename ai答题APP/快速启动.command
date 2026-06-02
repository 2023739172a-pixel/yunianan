#!/bin/bash
clear
echo "========================================"
echo "   🚀 AI 答题助手 - 快速启动"
echo "========================================"
echo ""
echo "[1/3] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误：没有找到 Node.js！"
    echo "请先去 https://nodejs.org 下载安装"
    read -p "按回车键退出..."
    exit 1
fi
echo "✅ Node.js 已安装"
echo ""
echo "[2/3] 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖（第一次需要几分钟）..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败！"
        read -p "按回车键退出..."
        exit 1
    fi
else
    echo "✅ 依赖已安装"
fi
echo ""
echo "[3/3] 启动服务..."
echo ""
echo "========================================"
echo "   🎉 启动成功！"
echo "========================================"
echo ""
echo "🌐 请在浏览器中打开：http://localhost:5173"
echo ""
echo "💡 提示：不要关闭此窗口，按 Ctrl+C 可停止服务"
echo ""
npm run dev
