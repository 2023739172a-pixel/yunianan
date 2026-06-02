
@echo off
chcp 65001 &gt;nul
echo ========================================
echo    📱 AI 答题助手 - APK 打包工具
echo ========================================
echo.

echo [1/7] 检查 Node.js...
node --version &gt;nul 2&gt;&amp;1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
echo ✅ Node.js 检查通过
echo.

echo [2/7] 安装 Capacitor 依赖...
if not exist "node_modules\@capacitor" (
    echo 正在安装 Capacitor...
    call npm install @capacitor/core @capacitor/cli @capacitor/android
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo ✅ 依赖已安装
)
echo.

echo [3/7] 初始化 Capacitor（如果需要）...
if not exist "capacitor.config.json" (
    echo 正在初始化 Capacitor...
    call npx cap init "AI答题助手" com.ai.answer
    if %errorlevel% neq 0 (
        echo ⚠️  初始化可能有问题，但继续尝试...
    )
) else (
    echo ✅ Capacitor 已初始化
)
echo.

echo [4/7] 构建前端项目...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
echo ✅ 前端构建完成
echo.

echo [5/7] 配置 Android 平台...
if not exist "android" (
    echo 正在添加 Android 平台...
    call npx cap add android
    if %errorlevel% neq 0 (
        echo ❌ 添加 Android 平台失败
        pause
        exit /b 1
    )
) else (
    echo ✅ Android 平台已添加
)
echo.

echo [6/7] 同步代码到 Android 项目...
call npx cap sync
echo ✅ 代码同步完成
echo.

echo [7/7] 构建 APK...
cd android
echo 正在使用 Gradle 构建 Debug APK...
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ❌ APK 构建失败
    echo.
    echo 提示：可以尝试在 Android Studio 中打开项目构建
    echo 运行命令：npx cap open android
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ APK 构建完成
echo.

echo ========================================
echo    🎉 打包成功！
echo ========================================
echo.
echo APK 文件位置：
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 你可以：
echo 1. 直接将此 APK 发送到手机安装
echo 2. 或运行 npx cap open android 打开 Android Studio
echo    进行更多配置或构建 Release 版本
echo.

if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo 正在打开 APK 所在文件夹...
    explorer android\app\build\outputs\apk\debug\
)

pause

