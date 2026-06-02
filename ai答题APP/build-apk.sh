
#!/bin/bash
clear
echo "========================================"
echo "   📱 AI 答题助手 - APK 打包工具"
echo "========================================"
echo ""

echo "[1/7] 检查 Node.js..."
if ! command -v node &amp;&gt; /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js"
    read -p "按回车键退出..."
    exit 1
fi
echo "✅ Node.js 检查通过"
echo ""

echo "[2/7] 安装 Capacitor 依赖..."
if [ ! -d "node_modules/@capacitor" ]; then
    echo "正在安装 Capacitor..."
    npm install @capacitor/core @capacitor/cli @capacitor/android
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        read -p "按回车键退出..."
        exit 1
    fi
else
    echo "✅ 依赖已安装"
fi
echo ""

echo "[3/7] 初始化 Capacitor（如果需要）..."
if [ ! -f "capacitor.config.json" ]; then
    echo "正在初始化 Capacitor..."
    npx cap init "AI答题助手" com.ai.answer
    if [ $? -ne 0 ]; then
        echo "⚠️  初始化可能有问题，但继续尝试..."
    fi
else
    echo "✅ Capacitor 已初始化"
fi
echo ""

echo "[4/7] 构建前端项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    read -p "按回车键退出..."
    exit 1
fi
echo "✅ 前端构建完成"
echo ""

echo "[5/7] 配置 Android 平台..."
if [ ! -d "android" ]; then
    echo "正在添加 Android 平台..."
    npx cap add android
    if [ $? -ne 0 ]; then
        echo "❌ 添加 Android 平台失败"
        read -p "按回车键退出..."
        exit 1
    fi
else
    echo "✅ Android 平台已添加"
fi
echo ""

echo "[6/7] 同步代码到 Android 项目..."
npx cap sync
echo "✅ 代码同步完成"
echo ""

echo "[7/7] 构建 APK..."
cd android
echo "正在使用 Gradle 构建 Debug APK..."
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    echo "❌ APK 构建失败"
    echo ""
    echo "提示：可以尝试在 Android Studio 中打开项目构建"
    echo "运行命令：npx cap open android"
    cd ..
    read -p "按回车键退出..."
    exit 1
fi
cd ..
echo "✅ APK 构建完成"
echo ""

echo "========================================"
echo "   🎉 打包成功！"
echo "========================================"
echo ""
echo "APK 文件位置："
echo "android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "你可以："
echo "1. 直接将此 APK 发送到手机安装"
echo "2. 或运行 npx cap open android 打开 Android Studio"
echo "   进行更多配置或构建 Release 版本"
echo ""

if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    if command -v open &amp;&gt; /dev/null; then
        echo "正在打开 APK 所在文件夹..."
        open android/app/build/outputs/apk/debug/
    fi
fi

read -p "按回车键退出..."

