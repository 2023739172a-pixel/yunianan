@echo off
chcp 65001 >nul
title AI答题助手 - 一键复制工具
color 0A

echo.
echo  ██████╗  ██████╗ ██████╗     ███████╗ █████╖ ██████╗ ███████╗
echo  ██╔══██╗██╔═══██╗██╔══██╗    ██╔════╝██╔══██╗██╔══██╗██╔════╝
echo  ██████╔╝██║   ██║██████╔╝    █████╗  ███████║██████╔╝█████╗
echo  ██╔═══╝ ██║   ██║██╔═══╝     ██╔══╝  ██╔══██║██╔══██╗██╔══╝
echo  ██║     ╚██████╔╝██║         ███████╗██║  ██║██║  ██║███████╗
echo  ╚═╝      ╚═════╝ ╚═╝         ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
echo.
echo ================================================
echo        一键复制到D盘工具 v1.0
echo ================================================
echo.

set "SOURCE_DIR=%~dp0"
set "TARGET_DIR=D:\AI答题助手"

echo [1/4] 检查源文件...
if not exist "%SOURCE_DIR%src" (
    echo [✗] 源文件不完整，缺少src目录
    echo.
    pause
    exit /b 1
)
if not exist "%SOURCE_DIR%android" (
    echo [✗] 源文件不完整，缺少android目录
    echo.
    pause
    exit /b 1
)
echo [✓] 源文件检查通过

echo.
echo [2/4] 准备目标目录...
if exist "%TARGET_DIR%" (
    echo [i] 目标目录已存在: %TARGET_DIR%
    echo.
    choice /c YN /m "是否覆盖现有文件"
    if errorlevel 2 (
        echo [i] 用户取消操作
        pause
        exit /b 0
    )
    echo [i] 删除旧目录...
    rmdir /s /q "%TARGET_DIR%"
)
mkdir "%TARGET_DIR%"
echo [✓] 目标目录准备完成

echo.
echo [3/4] 复制文件...
echo     正在复制，这可能需要几秒钟...
xcopy "%SOURCE_DIR%*" "%TARGET_DIR%\" /E /I /H /Y /C >nul
if errorlevel 1 (
    echo [✗] 复制过程中出现错误，但可能已完成
)
echo [✓] 文件复制完成

echo.
echo [4/4] 验证复制结果...
if exist "%TARGET_DIR%AI答题助手-APK构建工具.bat" (
    echo [✓] 验证成功
) else (
    echo [!] 警告：可能未完全复制
)

echo.
echo ================================================
echo  ✅ 复制完成！
echo ================================================
echo.
echo 目标位置: %TARGET_DIR%
echo.
echo 下一步：
echo 1. 进入目标目录: cd %TARGET_DIR%
echo 2. 检查环境: 双击运行 环境检查工具.bat
echo 3. 开始构建: 双击运行 AI答题助手-APK构建工具.bat
echo.
echo.
choice /c YN /m "是否打开目标文件夹"
if errorlevel 1 (
    explorer "%TARGET_DIR%"
)
echo.
echo 完成！
pause
