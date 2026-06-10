@echo off
chcp 65001 >nul
echo.
echo ==============================================
echo        AI答题助手 - 一键构建APK脚本
echo ==============================================
echo.

set "NODE_VERSION_REQUIRED=18.0.0"
set "JAVA_VERSION_REQUIRED=17"

echo [1/5] 检查Node.js版本...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装，请先安装Node.js v18+
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=1,2 delims=v." %%a in ('node --version') do (
    set "NODE_MAJOR=%%a"
    set "NODE_MINOR=%%b"
)
echo ✅ Node.js版本: v%NODE_MAJOR%.%NODE_MINOR%

echo.
echo [2/5] 检查Java版本...
java --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java未安装，请先安装JDK 17+
    echo    下载地址: https://adoptium.net/
    pause
    exit /b 1
)

for /f "tokens=3" %%a in ('java --version ^| findstr /i "version"') do (
    set "JAVA_VERSION=%%a"
)
echo ✅ Java版本: %JAVA_VERSION%

echo.
echo [3/5] 安装依赖...
echo 正在安装npm依赖，请耐心等待...
npm install
if %errorlevel% neq 0 (
    echo ❌ npm依赖安装失败
    pause
    exit /b 1
)
echo ✅ npm依赖安装成功

echo.
echo [4/5] 构建Web应用...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Web应用构建失败
    pause
    exit /b 1
)
echo ✅ Web应用构建成功

echo.
echo [5/5] 构建APK...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ❌ APK构建失败
    pause
    exit /b 1
)

echo.
echo ==============================================
echo 🎉 APK构建成功！
echo ==============================================
echo.
echo APK文件位置:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 可以直接将APK复制到手机安装！
echo.
pause