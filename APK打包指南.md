
# 📱 AI 答题助手 - APK 打包指南

本指南将帮助你将 Web 应用打包成 Android APK 安装包。

---

## 🎯 方法选择

我们使用 **Capacitor** 来打包，因为：
- 不需要重写代码
- 官方支持，文档完善
- 可以直接调用原生功能

---

## 📋 准备工作

### 需要安装的工具

1. **Node.js** (已安装)
2. **Java JDK 17+** - Android 开发必需
3. **Android Studio** - 包含 Android SDK
4. **Git** (可选)

---

## 🚀 快速开始

### 步骤 1: 安装 Capacitor

```bash
# 进入项目目录
cd /workspace

# 安装 Capacitor 核心依赖
npm install @capacitor/core @capacitor/cli @capacitor/android

# 初始化 Capacitor
npx cap init "AI答题助手" com.ai.answer
```

### 步骤 2: 构建前端项目

```bash
# 构建生产版本
npm run build
```

### 步骤 3: 添加 Android 平台

```bash
# 添加 Android 平台
npx cap add android

# 同步代码到 Android 项目
npx cap sync
```

### 步骤 4: 配置 Android

编辑 `android/app/build.gradle`，设置应用信息：

```gradle
android {
    defaultConfig {
        applicationId "com.ai.answer"
        minSdkVersion 22
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
}
```

### 步骤 5: 构建 APK

#### 方法一：使用 Android Studio（推荐）

```bash
# 打开 Android 项目
npx cap open android
```

然后在 Android Studio 中：
1. 等待项目同步
2. 点击菜单 Build → Build Bundle(s) / APK(s) → Build APK(s)
3. 等待构建完成
4. 在通知中点击定位，找到 APK 文件

#### 方法二：使用命令行

```bash
# 进入 Android 目录
cd android

# 使用 Gradle 构建 Debug APK
./gradlew assembleDebug

# 构建 Release APK (需要签名)
./gradlew assembleRelease
```

APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📦 使用自动化脚本（推荐）

我已经为你创建了自动化脚本！

### Windows 用户

```bash
# 双击运行
build-apk.bat
```

### Mac/Linux 用户

```bash
# 给脚本权限
chmod +x build-apk.sh

# 运行
./build-apk.sh
```

---

## 🔧 详细配置

### 1. 修改应用名称

编辑 `android/app/src/main/res/values/strings.xml`:

```xml
&lt;resources&gt;
    &lt;string name="app_name"&gt;AI答题助手&lt;/string&gt;
&lt;/resources&gt;
```

### 2. 修改应用图标

替换以下文件：
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png`

### 3. 修改启动画面

编辑 `android/app/src/main/res/values/themes.xml`:

```xml
&lt;style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar"&gt;
    &lt;item name="android:windowBackground"&gt;@drawable/splash&lt;/item&gt;
&lt;/style&gt;
```

### 4. 添加权限

编辑 `android/app/src/main/AndroidManifest.xml`:

```xml
&lt;uses-permission android:name="android.permission.INTERNET" /&gt;
&lt;uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" /&gt;
```

---

## 📤 分发 APK

### Debug APK

- 适合测试
- 无需签名
- 文件位置：`android/app/build/outputs/apk/debug/`

### Release APK

- 适合发布到应用商店
- 需要签名
- 文件位置：`android/app/build/outputs/apk/release/`

### 如何签名（可选）

```bash
# 生成密钥库
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 在 android/app/build.gradle 配置签名
```

---

## 🎨 自定义配置

### 修改 Splash Screen

创建 `android/app/src/main/res/drawable/splash.xml`:

```xml
&lt;?xml version="1.0" encoding="utf-8"?&gt;
&lt;layer-list xmlns:android="http://schemas.android.com/apk/res/android"&gt;
    &lt;item android:drawable="@color/splashBackground"/&gt;
    &lt;item&gt;
        &lt;bitmap
            android:gravity="center"
            android:src="@drawable/icon"/&gt;
    &lt;/item&gt;
&lt;/layer-list&gt;
```

### 修改颜色

创建 `android/app/src/main/res/values/colors.xml`:

```xml
&lt;?xml version="1.0" encoding="utf-8"?&gt;
&lt;resources&gt;
    &lt;color name="splashBackground"&gt;#3b82f6&lt;/color&gt;
    &lt;color name="colorPrimary"&gt;#3b82f6&lt;/color&gt;
    &lt;color name="colorPrimaryDark"&gt;#2563eb&lt;/color&gt;
    &lt;color name="colorAccent"&gt;#10b981&lt;/color&gt;
&lt;/resources&gt;
```

---

## 🚨 常见问题

### Q: 提示 JDK 未找到？
A: 安装 JDK 17+，并设置 JAVA_HOME 环境变量

### Q: Gradle 构建失败？
A: 检查网络连接，第一次构建需要下载依赖

### Q: APK 安装失败？
A: 确保手机允许安装未知来源应用

### Q: 应用闪退？
A: 查看 Logcat 日志，检查是否有运行时错误

---

## 📚 相关文档

- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [Android 开发者官网](https://developer.android.com/)
- [APK 签名教程](https://developer.android.com/studio/publish/app-signing)

---

## 🎉 成功了！

打包完成后，你会得到：
- ✅ 可直接安装的 APK 文件
- ✅ 可以分享给朋友安装测试
- ✅ 可以发布到应用商店

祝你打包顺利！🚀

