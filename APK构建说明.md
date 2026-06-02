# APK构建说明

## 📱 APK一键打包脚本

由于服务器网络环境限制，无法直接下载Android SDK和Gradle依赖。请在本地电脑上执行以下步骤：

### 方式一：一键打包（推荐）

#### Windows 用户
1. 双击运行 `build-apk.bat`
2. 等待构建完成
3. APK文件将生成在 `android\app\build\outputs\apk\debug\app-debug.apk`

#### Mac/Linux 用户
1. 打开终端，进入项目目录
2. 运行 `chmod +x build-apk.sh`
3. 运行 `./build-apk.sh`
4. 等待构建完成

### 方式二：手动构建

```bash
# 1. 安装Node.js依赖
npm install

# 2. 构建Web应用
npm run build

# 3. 同步到Android
npx cap sync android

# 4. 进入Android目录
cd android

# 5. 构建Debug APK
# Windows
.\gradlew.bat assembleDebug

# Mac/Linux
chmod +x gradlew
./gradlew assembleDebug

# 6. APK文件位置
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 方式三：使用Android Studio

1. 用Android Studio打开 `android` 文件夹
2. 等待Gradle同步完成
3. 点击菜单 `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
4. APK文件将生成在 `android\app\build\outputs\apk\debug\app-debug.apk`

## 📋 所需环境

### 必需环境
- **Node.js**: v18+ (推荐v20)
- **npm**: v8+ 或 **yarn**: v1.22+
- **Java JDK**: JDK 17+ (推荐JDK 21)
- **Android SDK**: API 22+
- **Gradle**: 8.14+ (可选，系统会自动下载)

### 环境检查

```bash
# 检查Node.js版本
node --version  # 应显示 v18+ 或 v20+

# 检查npm版本
npm --version  # 应显示 8+

# 检查Java版本
java --version  # 应显示 17+

# 检查Android SDK
echo $ANDROID_HOME  # 应显示Android SDK路径
```

### 安装指南

#### Node.js
- 官网：https://nodejs.org/
- 推荐安装LTS版本（v20.x）

#### Java JDK
- 官网：https://adoptium.net/
- 推荐JDK 21

#### Android SDK
1. 下载Android Studio：https://developer.android.com/studio
2. 安装时选择 "Custom" 并勾选：
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
3. 设置环境变量：
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

## 🎯 构建成功后的APK位置

```
/workspace/android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 安装APK到手机

### 方法一：直接传输
1. 将 `app-debug.apk` 复制到手机存储
2. 在手机上点击安装

### 方法二：使用ADB
```bash
# 连接手机（开启USB调试）
adb devices

# 安装APK
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

## 🔧 常见问题

### 1. Gradle下载失败
**问题**：构建时Gradle下载超时

**解决方案**：
- 使用VPN或代理
- 配置国内镜像：
  ```properties
  # gradle.properties
  distributionUrl=https://mirrors.aliyun.com/gradle/gradle-8.6-all.zip
  ```

### 2. Android SDK未找到
**问题**：提示 `ANDROID_HOME` 未设置

**解决方案**：
- Windows: 设置系统环境变量 `ANDROID_HOME`
- Mac/Linux: 在 `~/.bash_profile` 添加：
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
  ```

### 3. Java版本不兼容
**问题**：Gradle报错Java版本不支持

**解决方案**：
```bash
# 检查Java版本
java --version

# 如果版本低于17，需要升级JDK
```

### 4. 构建失败
**解决方案**：
```bash
# 清理构建缓存
cd android
./gradlew clean

# 重新构建
./gradlew assembleDebug --stacktrace
```

## 📞 获取帮助

如果构建过程中遇到问题：
1. 查看错误日志
2. 搜索错误信息
3. 参考Android Studio官方文档
4. 检查环境配置

## 🎉 构建成功！

恭喜！APK构建成功后将显示：
```
BUILD SUCCESSFUL in Xm Xs
17 actionable tasks: X executed, X up-to-date
```

APK文件位置：`android\app\build\outputs\apk\debug\app-debug.apk`
