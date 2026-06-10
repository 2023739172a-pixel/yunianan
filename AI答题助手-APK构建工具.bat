@echo off
chcp 65001 >nul
title AI答题助手 - APK构建工具
color 0A

echo.
echo  ██████╗  ██████╗ ██████╗     ███████╗ █████╖ ██████╗ ███████╗   ██████╗ ███████╗██████╗ ███╗   ███╗██╗███╗   ╗██╗ ██████╗ ██████╗  ██████╗ ███╗   ██╗
echo  ██╔══██╗██╔═══██╗██╔══██╗    ██╔════╝██╔══██╗██╔══██╗██╔════╝   ██╔══██╗██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██║██╔═══██╗██╔══██╗██╔═══██╗████╗ ████║
echo  ██████╔╝██║   ██║██████╔╝    █████╗  ███████║██████╔╝█████╗     ██████╔╝█████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║██║██║   ██║██████╔╝██║   ██║██╔████╔██║
echo  ██╔═══╝ ██║   ██║██╔═══╝     ██╔══╝  ██╔══██║██╔══██╗██╔══╝     ██╔══██╗██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██║██║   ██║██╔══██╗██║   ██║██║╚██╔╝██║
echo  ██║     ╚██████╔╝██║         ███████╗██║  ██║██║  ██║███████╗   ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║╚██████╔╝██║  ██║╚██████╔╝██║ ╚═╝ ██║
echo  ╚═╝      ╚═════╝ ╚═╝         ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝
echo.
echo ================================================
echo        AI答题助手 - 一键APK构建工具 v2.0
echo ================================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] 提示: 建议以管理员身份运行以避免权限问题
    echo.
)

:: 设置项目路径
set PROJECT_PATH=%~dp0
set ANDROID_PROJECT=%PROJECT_PATH%android

echo [1/8] 检查环境...
echo.

:: 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [✗] Node.js 未安装
    echo.
    echo 请先安装 Node.js v18+:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=1" %%a in ('node --version') do set NODE_VERSION=%%a
echo [✓] Node.js: %NODE_VERSION%

:: 检查Java
java --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [✗] Java 未安装
    echo.
    echo 请先安装 JDK 17+:
    echo https://adoptium.net/
    echo.
    pause
    exit /b 1
)
for /f "tokens=3" %%a in ('java --version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%a
echo [✓] Java: %JAVA_VERSION%

:: 检查Android SDK
if not defined ANDROID_HOME (
    echo [!] ANDROID_HOME 未设置
    echo [i] 尝试自动检测...
    
    :: 检查常见位置
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
    ) else if exist "C:\Android\Sdk" (
        set ANDROID_HOME=C:\Android\Sdk
    ) else if exist "D:\Android\Sdk" (
        set ANDROID_HOME=D:\Android\Sdk
    )
)

if not defined ANDROID_HOME (
    echo [✗] Android SDK 未找到
    echo.
    echo 请先安装 Android Studio:
    echo https://developer.android.com/studio
    echo.
    echo 或者手动设置 ANDROID_HOME 环境变量:
    echo 例如: set ANDROID_HOME=C:\Users\你的用户名\AppData\Local\Android\Sdk
    echo.
    pause
    exit /b 1
)

if exist "%ANDROID_HOME%\platforms" (
    echo [✓] Android SDK: %ANDROID_HOME%
) else (
    echo [!] Android SDK 目录不完整
    echo 请确保安装了 Android SDK Platform
)

echo.
echo [2/8] 清理旧构建...
if exist "%PROJECT_PATH%dist" rmdir /s /q "%PROJECT_PATH%dist"
if exist "%PROJECT_PATH%node_modules" rmdir /s /q "%PROJECT_PATH%node_modules"
echo [✓] 清理完成

echo.
echo [3/8] 安装npm依赖...
echo 这可能需要几分钟，请耐心等待...
echo.
cd /d "%PROJECT_PATH%"
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [✗] npm依赖安装失败
    echo.
    echo 尝试以下解决方案:
    echo 1. 清除npm缓存: npm cache clean --force
    echo 2. 删除node_modules后重试
    echo 3. 使用管理员身份运行
    echo.
    pause
    exit /b 1
)
echo [✓] npm依赖安装成功

echo.
echo [4/8] 构建Web应用...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [✗] Web应用构建失败
    pause
    exit /b 1
)
echo [✓] Web应用构建成功

echo.
echo [5/8] 同步到Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo.
    echo [✗] 同步失败
    pause
    exit /b 1
)
echo [✓] 同步完成

echo.
echo [6/8] 配置Gradle...
echo.

:: 配置Gradle使用国内镜像
if exist "%ANDROID_PROJECT%\gradle\wrapper\gradle-wrapper.properties" (
    echo [i] 检测到Gradle配置
    
    :: 备份原配置
    copy "%ANDROID_PROJECT%\gradle\wrapper\gradle-wrapper.properties" "%ANDROID_PROJECT%\gradle\wrapper\gradle-wrapper.properties.bak" >nul 2>&1
    
    :: 创建新的Gradle配置
    (
        echo distributionBase=GRADLE_USER_HOME
        echo distributionPath=wrapper/dists
        echo distributionUrl=https:\/\/mirrors.cloud.tencent.com\/gradle\/gradle-8.6-all.zip
        echo networkTimeout=10000
        echo zipStoreBase=GRADLE_USER_HOME
        echo zipStorePath=wrapper/dists
    ) > "%ANDROID_PROJECT%\gradle\wrapper\gradle-wrapper.properties"
    
    echo [✓] 已切换到腾讯云Gradle镜像
)

echo.
echo [7/8] 构建APK...
echo.

:: 进入Android目录
cd /d "%ANDROID_PROJECT%"

:: 运行Gradle构建
call gradlew.bat assembleDebug --no-daemon --stacktrace
if %errorlevel% neq 0 (
    echo.
    echo [✗] APK构建失败
    echo.
    echo 常见问题解决方案:
    echo 1. 检查ANDROID_HOME环境变量
    echo 2. 确保安装了Android SDK Platform
    echo 3. 检查网络连接
    echo.
    pause
    exit /b 1
)

echo.
echo [8/8] 完成！
echo.

:: 查找生成的APK
set APK_PATH=
for /r "%ANDROID_PROJECT%\app\build\outputs\apk\debug" %%f in (*.apk) do (
    set APK_PATH=%%f
)

if defined APK_PATH (
    echo ================================================
    echo  🎉 APK构建成功！
    echo ================================================
    echo.
    echo APK文件位置:
    echo %APK_PATH%
    echo.
    echo 文件大小:
    for %%A in ("%APK_PATH%") do echo %%~zA bytes ^(约 %%~zA bytes^)
    echo.
    echo 操作选项:
    echo 1. 直接安装到手机 ^(需要USB连接或手机在同一WiFi^)
    echo 2. 复制APK到项目根目录
    echo 3. 打开APK所在文件夹
    echo.
    set /p choice="请选择 (1/2/3/Q退出): "
    
    if /i "%choice%"=="1" (
        echo [i] 安装APK...
        adb install -r "%APK_PATH%"
        if %errorlevel% equ 0 (
            echo [✓] 安装成功！
        ) else (
            echo [!] 安装失败，请检查手机连接
        )
    ) else if /i "%choice%"=="2" (
        copy "%APK_PATH%" "%PROJECT_PATH%AI答题助手.apk"
        echo [✓] 已复制到: %PROJECT_PATH%AI答题助手.apk
    ) else if /i "%choice%"=="3" (
        explorer /select,"%APK_PATH%"
    )
) else (
    echo [✗] 未找到APK文件，构建可能失败
)

echo.
echo ================================================
echo           感谢使用 AI答题助手！
echo ================================================
echo.
pause
