# AI答题助手 APK构建包

## 📱 这是什么？

这是一个完整的手机APP项目，可以：
- 🎯 AI智能搜题（豆包、千问、元宝等）
- 📚 学习通集成（登录、签到功能）
- 🌐 内置学习通网页
- 📸 拍照答题
- 🎯 悬浮窗搜题

## 🚀 如何构建APK？

### 方法一：一键构建（最简单）

1. **确保安装了以下软件**：
   - Node.js v18+ → https://nodejs.org/
   - Java JDK 17+ → https://adoptium.net/
   - Android Studio → https://developer.android.com/studio

2. **双击运行**：`AI答题助手-APK构建工具.bat`

3. **等待构建完成**（首次约10-30分钟）

4. **找到APK文件**：
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```

### 方法二：快速构建

1. **安装环境**（同上）

2. **双击运行**：`快速构建.bat`

3. **等待完成**

## 📋 构建前置条件

### 1. 安装 Node.js
下载地址：https://nodejs.org/
```
验证安装：node --version
```

### 2. 安装 Java JDK 17+
下载地址：https://adoptium.net/
```
验证安装：java --version
```

### 3. 安装 Android Studio
下载地址：https://developer.android.com/studio

安装时确保勾选：
- Android SDK
- Android SDK Platform
- Android Build Tools

## 🎯 功能特性

### ✅ AI答题助手
- 支持豆包、千问、元宝等AI助手
- 多平台并行搜索
- 智能降级机制
- 高质量Mock回答

### ✅ 学习通集成
- 内置学习通网页
- 虚拟定位签到
- 扫码签到
- 位置签到辅助

### ✅ 悬浮窗功能
- 后台悬浮窗搜题
- 自动连续答题
- 拍照答题支持

## 📁 项目结构

```
AI答题助手/
├── src/                          # 前端源代码
│   ├── components/               # 组件
│   ├── pages/                    # 页面
│   ├── utils/                    # 工具函数
│   └── ...
│
├── android/                      # Android项目
│   └── app/
│       └── build/
│           └── outputs/
│               └── apk/
│                   └── debug/
│                       └── app-debug.apk  ← APK输出位置
│
├── dist/                         # Web构建产物
├── node_modules/                 # 依赖包
│
├── AI答题助手-APK构建工具.bat     # ⭐ 一键构建工具
├── 快速构建.bat                   # 快速构建脚本
├── package.json                  # 项目配置
└── 本地APK构建指南.md            # 详细构建说明
```

## ❓ 常见问题

### Q1: 构建失败怎么办？
**A**: 查看构建日志，通常是环境问题：
1. 确认 Node.js 安装成功
2. 确认 Java 安装成功
3. 确认 Android SDK 安装成功
4. 检查网络连接

### Q2: 提示 "ANDROID_HOME 未设置"
**A**: 
1. 打开 Android Studio → Settings → SDK Manager
2. 复制 "Android SDK Location" 路径
3. 设置环境变量：
   ```
   ANDROID_HOME = C:\Users\你的用户名\AppData\Local\Android\Sdk
   ```

### Q3: npm install 很慢
**A**: 
1. 使用管理员身份运行
2. 或设置npm镜像：
   ```cmd
   npm config set registry https://registry.npmmirror.com
   ```

### Q4: Gradle 下载失败
**A**: 
脚本已自动切换到腾讯云镜像，如果仍然失败：
1. 检查网络连接
2. 使用代理（如果有）
3. 手动下载Gradle

## 📱 安装APK

构建成功后：

1. **复制APK到手机**
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```

2. **手机设置**
   - 设置 → 安全 → 允许未知来源应用

3. **安装APK**
   - 点击APK文件
   - 选择安装

## 🔧 手动构建命令

如果自动化脚本失败，可以手动执行：

```cmd
cd D:\你的项目路径

:: 1. 安装依赖
npm install

:: 2. 构建Web
npm run build

:: 3. 同步Android
npx cap sync android

:: 4. 构建APK
cd android
gradlew.bat assembleDebug
```

## 🎉 成功标志

看到以下信息表示构建成功：

```
================================================
  🎉 APK构建成功！
================================================

APK文件位置:
D:\...\android\app\build\outputs\apk\debug\app-debug.apk
```

## 📞 技术支持

### 项目技术栈
- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **移动端**: Capacitor
- **后端**: Express.js + TypeScript
- **构建**: Gradle

### 相关文档
- `本地APK构建指南.md` - 详细构建说明
- `APK构建说明.md` - 常见问题解答

---

**祝您使用愉快！🎊**
