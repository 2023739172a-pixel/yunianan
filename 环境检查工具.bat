@echo off
chcp 65001 >nul
title AI答题助手 - 环境检查工具
color 0B

echo.
echo  ██████╗  ██████╗ ██████╗     ███████╗ █████╖ ██████╗ ███████╗
echo  ██╔══██╗██╔═══██╗██╔══██╗    ██╔════╝██╔══██╗██╔══██╗██╔════╝
echo  ██████╔╝██║   ██║██████╔╝    █████╗  ███████║██████╔╝█████╗
echo  ██╔═══╝ ██║   ██║██╔═══╝     ██╔══╝  ██╔══██║██╔══██╗██╔══╝
echo  ██║     ╚██████╔╝██║         ███████╗██║  ██║██║  ██║███████╗
echo  ╚═╝      ╚═════╝ ╚═╝         ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
echo.
echo ================================================
echo        环境检查与配置工具 v1.0
echo ================================================
echo.

set "ALL_OK=1"

echo [检查 1/5] Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=1" %%a in ('node --version') do (
        echo [✓] Node.js已安装: %%a
    )
) else (
    echo [✗] Node.js未安装
    echo   下载地址: https://nodejs.org/
    echo.
    set "ALL_OK=0"
)

echo.
echo [检查 2/5] Java JDK
java --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=3" %%a in ('java --version 2^>^&1 ^| findstr /i "version"') do (
        echo [✓] Java已安装: %%a
    )
) else (
    echo [✗] Java未安装
    echo   下载地址: https://adoptium.net/
    echo.
    set "ALL_OK=0"
)

echo.
echo [检查 3/5] Android SDK
if defined ANDROID_HOME (
    echo [✓] ANDROID_HOME: %ANDROID_HOME%
    if exist "%ANDROID_HOME%\platforms" (
        echo [✓] Android SDK Platform已安装
    ) else (
        echo [!] Android SDK Platform未安装
        echo   请打开Android Studio安装
        set "ALL_OK=0"
    )
) else (
    echo [!] ANDROID_HOME未设置
    echo.
    echo   尝试自动检测常见位置...
    
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        echo [✓] 找到: %LOCALAPPDATA%\Android\Sdk
        echo.
        echo [i] 请在环境变量中添加：
        echo     ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
    ) else if exist "C:\Android\Sdk" (
        echo [✓] 找到: C:\Android\Sdk
        echo.
        echo [i] 请在环境变量中添加：
        echo     ANDROID_HOME=C:\Android\Sdk
    ) else if exist "D:\Android\Sdk" (
        echo [✓] 找到: D:\Android\Sdk
        echo.
        echo [i] 请在环境变量中添加：
        echo     ANDROID_HOME=D:\Android\Sdk
    ) else (
        echo [✗] 未找到Android SDK
        echo   请安装Android Studio: https://developer.android.com/studio
        set "ALL_OK=0"
    )
)

echo.
echo [检查 4/5] Gradle
gradle --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%a in ('gradle --version ^| findstr "Gradle"') do (
        echo [✓] Gradle已安装: %%a
    )
) else (
    echo [!] Gradle未安装（可选，Android Studio会自带）
)

echo.
echo [检查 5/5] npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=1" %%a in ('npm --version') do (
        echo [✓] npm已安装: v%%a
    )
) else (
    echo [✗] npm未安装（Node.js应该包含npm）
    set "ALL_OK=0"
)

echo.
echo ================================================
if "%ALL_OK%"=="1" (
    echo  ✅ 所有环境已就绪！
    echo.
    echo  可以开始构建APK了！
    echo  运行: AI答题助手-APK构建工具.bat
) else (
    echo  ⚠️  环境检查未通过
    echo.
    echo  请先安装缺失的软件，然后重新运行此工具
)

echo ================================================
echo.
echo [提示] 设置环境变量方法：
echo   1. Win+R 输入: sysdm.cpl
echo   2. 高级 → 环境变量
echo   3. 系统变量 → 新建/编辑
echo.
echo   常用变量：
echo   - JAVA_HOME: JDK安装路径
echo   - ANDROID_HOME: Android SDK路径
echo.
pause
