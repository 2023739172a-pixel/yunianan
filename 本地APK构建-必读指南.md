# AI答题助手 - 本地APK构建指南

## 问题说明

当前沙箱环境网络受限，无法访问以下地址：
- services.gradle.org
- dl.google.com
- maven.google.com

因此无法在线构建APK。本方案提供**本地一键构建**。

---

## 快速构建步骤（Windows）

### 步骤1：下载项目包

从GitHub下载项目：
```
https://github.com/2023739172a-pixel/yunianan/archive/refs/heads/main.zip
```

或者克隆仓库：
```bash
git clone https://github.com/2023739172a-pixel/yunianan.git
```

### 步骤2：安装必要软件

1. **Node.js 20+**
   - 下载地址：https://nodejs.org/
   - 安装后打开CMD验证：`node -v`

2. **JDK 21**
   - 下载地址：https://adoptium.net/temurin/releases/?version=21
   - 安装后验证：`java -version`

3. **Android Studio**（可选，推荐）
   - 下载地址：https://developer.android.com/studio
   - 安装时选择"Android SDK"

### 步骤3：一键构建

双击运行项目中的：
```
快速构建.bat
```

或者手动在CMD中执行：
```bash
cd 项目目录
快速构建.bat
```

---

## 详细手动构建

如果一键脚本失败，按以下步骤：

### 1. 安装依赖
```bash
npm install
```

### 2. 构建前端
```bash
npm run build
```

### 3. 同步Capacitor
```bash
npx cap sync android
```

### 4. 构建APK
```bash
cd android
gradlew assembleDebug
```

APK文件位置：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 常见问题

### Q: 提示"gradlew不是内部或外部命令"
A: Windows需要先运行：
```bash
cd android
gradlew.bat assembleDebug
```

### Q: 提示"JAVA_HOME未设置"
A: 系统环境变量添加：
```
JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-21.0.x.x
```

### Q: 下载依赖太慢
A: 配置国内镜像，在项目根目录创建 `gradle.properties`：
```properties
org.gradle.jvmargs=-Xmx2048m
android.useAndroidX=true
android.nonTransitiveRClass=true
```

在 `android/build.gradle` 中添加阿里云镜像：
```groovy
repositories {
    maven { url 'https://maven.aliyun.com/repository/google' }
    maven { url 'https://maven.aliyun.com/repository/central' }
    maven { url 'https://maven.aliyun.com/repository/public' }
    google()
    mavenCentral()
}
```

### Q: Android SDK未安装
A: 
1. 下载 Android Studio：https://developer.android.com/studio
2. 首次运行会自动提示安装SDK
3. 或者单独下载：https://developer.android.com/studio#command-line-tools-only

设置环境变量：
```
ANDROID_HOME = C:\Users\你的用户名\AppData\Local\Android\Sdk
```

---

## 构建成功标志

看到以下输出表示成功：
```
BUILD SUCCESSFUL in Xm XXs
app-debug.apk
```

APK文件位置：
```
android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 快速验证清单

- [ ] Node.js 已安装 (v20+)
- [ ] JDK 21 已安装
- [ ] Android SDK 已安装 (API 34)
- [ ] 网络连接正常
- [ ] 运行 `快速构建.bat`

---

## 一键构建脚本内容

项目中的 `快速构建.bat` 内容：

```batch
@echo off
chcp 65001
echo ========================================
echo   AI答题助手 - APK一键构建
echo ========================================
echo.

echo [1/5] 检查Node.js...
node -v
if errorlevel 1 (
    echo 错误：Node.js未安装！
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/5] 安装npm依赖...
call npm install
if errorlevel 1 (
    echo 错误：npm安装失败！
    pause
    exit /b 1
)

echo.
echo [3/5] 构建前端...
call npm run build
if errorlevel 1 (
    echo 错误：前端构建失败！
    pause
    exit /b 1
)

echo.
echo [4/5] 同步Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo 错误：Capacitor同步失败！
    pause
    exit /b 1
)

echo.
echo [5/5] 构建APK...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo 错误：APK构建失败！
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   构建成功！
echo ========================================
echo.
echo APK文件位置：
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 可以直接安装到手机进行测试！
echo.
pause
```

---

## 技术支持

如有问题，请检查：
1. 网络连接是否正常
2. Node.js和JDK是否正确安装
3. Android SDK是否已安装并配置环境变量

---

**祝构建成功！**
