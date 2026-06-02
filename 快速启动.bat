@echo off
chcp 65001 >nul
echo ========================================
echo    🚀 AI 答题助手 - 快速启动
echo ========================================
echo.
echo [1/3] 检查 Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：没有找到 Node.js！
    echo 请先去 https://nodejs.org 下载安装
    pause
    exit /b 1
)
echo ✅ Node.js 已安装
echo.
echo [2/3] 检查依赖...
if not exist "node_modules" (
    echo 📦 正在安装依赖（第一次需要几分钟）...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败！
        pause
        exit /b 1
    )
) else (
    echo ✅ 依赖已安装
)
echo.
echo [3/3] 启动服务...
echo.
echo ========================================
echo    🎉 启动成功！
echo ========================================
echo.
echo 🌐 请在浏览器中打开：http://localhost:5173
echo.
echo 💡 提示：不要关闭此窗口，按 Ctrl+C 可停止服务
echo.
call npm run dev
pause
