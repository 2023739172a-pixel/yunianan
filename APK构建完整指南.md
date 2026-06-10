# 📱 AI答题助手 - APK构建指南

## 🚀 方式一：使用GitHub Actions自动构建（推荐）

### 无需安装任何开发工具！

#### Step 1: 推送到GitHub

```bash
# 在终端中运行以下命令
cd /workspace

# 设置远程仓库（使用SSH更方便）
git remote add origin git@github.com:2023739172a-pixel/ai-APP.git
git push -u origin main
```

#### Step 2: 自动构建APK
推送后，GitHub Actions会自动开始构建，大约10-15分钟完成。

#### Step 3: 下载APK
1. 打开仓库：https://github.com/2023739172a-pixel/ai-APP
2. 点击 "Actions" 标签
3. 找到 "Build APK" 工作流
4. 在底部 "Artifacts" 下载 `app-debug.apk`

---

## 🛠️ 方式二：本地构建

### 所需环境

| 工具 | 版本 | 下载地址 |
|------|------|----------|
| Node.js | v18+ | https://nodejs.org/ |
| Java JDK | 17+ | https://adoptium.net/ |
| Android SDK | API 22+ | https://developer.android.com/studio |

### 安装步骤

#### 1. 安装Node.js
```bash
# 检查版本
node --version  # 应显示 v18+
npm --version   # 应显示 8+
```

#### 2. 安装Java
```bash
# 检查版本
java --version  # 应显示 17+
```

#### 3. 安装Android SDK
1. 下载Android Studio：https://developer.android.com/studio
2. 安装时选择 "Custom" 安装
3. 确保勾选：
   - Android SDK
   - Android SDK Platform
   - Android Build Tools
4. 设置环境变量：
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

#### 4. 构建APK

```bash
# 进入项目目录
cd /workspace

# 安装依赖
npm install

# 构建Web应用
npm run build

# 同步到Android
npx cap sync android

# 进入Android目录
cd android

# 构建APK
./gradlew assembleDebug

# APK位置：android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📋 项目结构

```
/workspace/
├── src/              # 前端源代码
├── android/          # Android项目
├── dist/             # 构建产物
├── package.json      # 项目配置
├── vite.config.ts    # Vite配置
├── tailwind.config.js# Tailwind配置
└── capacitor.config.json  # Capacitor配置
```

---

## 🎯 功能特性

### ✅ AI答题助手
- 支持豆包、千问、元宝等AI助手
- 多平台并行搜索
- 智能降级机制

### ✅ 学习通集成
- 内置学习通网页
- 虚拟定位签到
- 扫码签到功能

### ✅ 悬浮窗功能
- 后台悬浮窗搜题
- 自动连续答题
- 拍照答题支持

---

## 📞 常见问题

### Q1: Gradle下载失败
**解决方案**：
```bash
# 修改gradle-wrapper.properties使用国内镜像
distributionUrl=https://mirrors.aliyun.com/gradle/gradle-8.6-all.zip
```

### Q2: Android SDK未找到
**解决方案**：
```bash
# 设置环境变量
export ANDROID_HOME=/path/to/your/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Q3: Java版本不兼容
**解决方案**：
```bash
# 使用JDK 17或21
java --version
```

---

## 🎉 构建成功！

APK生成后位置：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

直接复制到手机即可安装！
