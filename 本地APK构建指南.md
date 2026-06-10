# 🎯 AI答题助手 - 本地APK构建指南

## 📦 快速开始

### 方法一：一键构建（推荐）

1. **复制整个项目文件夹**到您的电脑，例如：
   ```
   D:\软件\AI答题助手
   ```

2. **双击运行** `AI答题助手-APK构建工具.bat`

3. **等待构建完成**（首次约10-30分钟，后续更快）

4. **获取APK**：
   ```
   D:\软件\AI答题助手\android\app\build\outputs\apk\debug\app-debug.apk
   ```

---

## 🛠️ 环境要求

### 必须安装

| 工具 | 版本 | 下载地址 | 检查命令 |
|------|------|----------|----------|
| Node.js | v18+ | [点击下载](https://nodejs.org/) | `node --version` |
| Java JDK | 17+ | [点击下载](https://adoptium.net/) | `java --version` |
| Android SDK | API 22+ | [点击下载Android Studio](https://developer.android.com/studio) | `echo %ANDROID_HOME%` |

### 安装顺序

1. **安装 Node.js** → https://nodejs.org/ (下载LTS版本)
2. **安装 JDK 17+** → https://adoptium.net/ (选择JDK 17或21)
3. **安装 Android Studio** → https://developer.android.com/studio
   - 安装时选择 "Custom"
   - 勾选 "Android SDK" 和 "Android SDK Platform"

---

## 📁 项目文件夹结构

```
D:\软件\AI答题助手\
│
├── src/                          # 前端源代码
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
├── AI答题助手-APK构建工具.bat     # ⭐ 完整版构建工具
├── 快速构建.bat                   # 简化版构建脚本
├── package.json                  # 项目配置
├── vite.config.ts               # Vite配置
└── capacitor.config.json         # Capacitor配置
```

---

## 🚀 构建步骤详解

### 步骤1：复制项目

1. 将 `/workspace` 文件夹复制到您的电脑
2. 建议路径：`D:\软件\AI答题助手`

### 步骤2：运行构建脚本

**方式A：使用完整版构建工具**
```
双击: AI答题助手-APK构建工具.bat
```

完整版会自动：
- ✅ 检查环境配置
- ✅ 安装npm依赖
- ✅ 构建Web应用
- ✅ 同步到Android
- ✅ 下载Gradle依赖
- ✅ 构建APK
- ✅ 提供安装选项

**方式B：使用快速构建**
```
双击: 快速构建.bat
```

简化版会逐步执行构建过程。

### 步骤3：等待构建完成

首次构建需要：
- 下载Gradle（约100MB）
- 下载Android构建工具
- 下载依赖库

⏱️ **预计时间**：10-30分钟（取决于网络速度）

### 步骤4：获取APK

APK文件位置：
```
D:\软件\AI答题助手\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 💡 常见问题与解决方案

### ❌ 问题1：Node.js未安装

**错误信息**：
```
'node' 不是内部或外部命令
```

**解决方案**：
1. 下载并安装 Node.js：https://nodejs.org/
2. 选择 LTS 版本（v18 或 v20）
3. 安装完成后，重新打开命令提示符
4. 验证：`node --version`

---

### ❌ 问题2：Java未安装

**错误信息**：
```
'java' 不是内部或外部命令
```

**解决方案**：
1. 下载JDK 17+：https://adoptium.net/
2. 安装时记住安装路径
3. 设置环境变量：
   ```
   JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.0.11.9-hotspot
   PATH = %JAVA_HOME%\bin;%PATH%
   ```
4. 重启命令提示符
5. 验证：`java --version`

---

### ❌ 问题3：Android SDK未找到

**错误信息**：
```
ANDROID_HOME 未设置
```

**解决方案**：

**方法A：自动检测**
脚本会自动检测以下位置：
- `%LOCALAPPDATA%\Android\Sdk`
- `C:\Android\Sdk`
- `D:\Android\Sdk`

**方法B：手动设置**
1. 安装 Android Studio
2. 打开 Android Studio → Settings → SDK Manager
3. 复制 "Android SDK Location" 路径
4. 设置环境变量：
   ```
   ANDROID_HOME = C:\Users\你的用户名\AppData\Local\Android\Sdk
   ```
5. 重启命令提示符

---

### ❌ 问题4：Gradle下载失败

**错误信息**：
```
Could not resolve all artifacts for configuration 'classpath'.
```

**解决方案**：

1. **方法A：使用国内镜像**
   - 构建脚本会自动切换到腾讯云镜像
   - 或手动修改 `android\gradle\wrapper\gradle-wrapper.properties`：
     ```properties
     distributionUrl=https://mirrors.cloud.tencent.com/gradle/gradle-8.6-all.zip
     ```

2. **方法B：使用代理**
   - 如果有代理服务器
   - 在命令提示符中设置：
     ```cmd
     set HTTP_PROXY=http://代理服务器:端口
     set HTTPS_PROXY=http://代理服务器:端口
     ```

3. **方法C：手动下载**
   - 下载 Gradle 8.6: https://services.gradle.org/distributions/gradle-8.6-all.zip
   - 解压到 `C:\Gradle`
   - 设置环境变量：
     ```
     GRADLE_HOME = C:\Gradle\gradle-8.6
     PATH = %GRADLE_HOME%\bin;%PATH%
     ```

---

### ❌ 问题5：npm install 失败

**错误信息**：
```
npm ERR! 
```

**解决方案**：

1. **清除缓存**
   ```cmd
   npm cache clean --force
   ```

2. **删除node_modules后重试**
   ```cmd
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   ```

3. **使用管理员身份运行**
   - 右键 "命令提示符" → "以管理员身份运行"
   - 再执行构建命令

---

### ❌ 问题6：APK构建超时

**错误信息**：
```
BUILD FAILED
Timeout waiting for lock
```

**解决方案**：

1. **关闭占用进程**
   ```cmd
   taskkill /f /im java.exe
   taskkill /f /im gradle.exe
   ```

2. **删除锁文件**
   ```cmd
   rmdir /s /q .gradle
   rmdir /s /q android\.gradle
   rmdir /s /q android\app\build
   ```

3. **重新构建**
   ```cmd
   快速构建.bat
   ```

---

### ❌ 问题7：找不到APK文件

**检查步骤**：

1. **确认构建成功**
   - 查看命令输出是否有 `[BUILD SUCCESSFUL]`
   - 是否有 `app-debug.apk` 路径提示

2. **查找APK位置**
   ```
   D:\软件\AI答题助手\android\app\build\outputs\apk\debug\
   ```

3. **如果目录不存在**
   - 检查构建日志
   - 确认没有错误
   - 重新运行构建

---

## 🔧 手动构建命令

如果自动化脚本失败，可以使用以下命令逐步构建：

```cmd
cd D:\软件\AI答题助手

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

---

## 📱 安装APK到手机

### 方法1：直接复制安装
1. 将 `app-debug.apk` 复制到手机
2. 点击APK文件安装
3. 如果提示"未知来源"，在设置中允许安装

### 方法2：使用ADB安装
1. 手机开启USB调试
2. 连接电脑
3. 运行命令：
   ```cmd
   adb install -r "D:\软件\AI答题助手\android\app\build\outputs\apk\debug\app-debug.apk"
   ```

### 方法3：局域网安装
1. 手机和电脑在同一WiFi
2. 电脑运行：
   ```cmd
   adb pair 192.168.x.x:端口
   adb connect 192.168.x.x:5555
   adb install -r "D:\软件\AI答题助手\android\app\build\outputs\apk\debug\app-debug.apk"
   ```

---

## 🎉 成功标志

看到以下信息表示构建成功：

```
================================================
  🎉 APK构建成功！
================================================

APK文件位置:
D:\软件\AI答题助手\android\app\build\outputs\apk\debug\app-debug.apk

文件大小: xxxxxxxx bytes
```

---

## 📞 获取帮助

如果遇到问题：
1. 查看构建日志
2. 搜索错误信息
3. 参考"常见问题"部分
4. 重新尝试构建

---

**祝您构建成功！🎊**
