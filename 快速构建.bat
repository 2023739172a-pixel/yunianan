@echo off
chcp 65001 >nul
title AI答题助手 - 快速构建

echo.
echo ================================================
echo    AI答题助手 - 快速构建APK
echo ================================================
echo.

cd /d "%~dp0"

echo [1/4] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo [✗] 安装失败
    pause
    exit /b 1
)
echo [✓] 完成

echo.
echo [2/4] 构建Web...
call npm run build
if %errorlevel% neq 0 (
    echo [✗] 构建失败
    pause
    exit /b 1
)
echo [✓] 完成

echo.
echo [3/4] 同步Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [✗] 同步失败
    pause
    exit /b 1
)
echo [✓] 完成

echo.
echo [4/4] 构建APK...
cd android
call gradlew.bat assembleDebug --no-daemon

echo.
echo ================================================
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo  🎉 构建成功！
    echo.
    echo APK: %~dp0android\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo [✗] 构建失败
)
echo ================================================
pause
