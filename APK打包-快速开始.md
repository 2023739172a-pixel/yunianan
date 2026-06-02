
# 📱 AI 答题助手 - APK 打包快速开始

## 方法一：用自动化脚本（推荐）

### Windows 用户

```
1. 双击运行：build-apk.bat
2. 等待完成
3. APK 位置：android/app/build/outputs/apk/debug/app-debug.apk
```

### Mac/Linux 用户

```bash
1. chmod +x build-apk.sh
2. ./build-apk.sh
3. APK 位置：android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 方法二：手动分步（需要安装 Android Studio）

### 1. 安装 Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 2. 初始化

```bash
npm run cap:init
npm run cap:add:android
```

### 3. 构建并同步

```bash
npm run build
npm run cap:sync
```

### 4. 打开 Android Studio

```bash
npm run cap:open:android
```

### 5. 在 Android Studio 中构建

- 菜单 → Build → Build Bundle(s) / APK(s) → Build APK(s)
- 等待完成
- 找到 APK 文件

---

## 方法三：最简单 - 直接用 PWA！

不需要打包！

1. 启动应用：`npm run dev`
2. 手机访问（电脑开热点）
3. 浏览器菜单 → 添加到主屏幕
4. 像 APP 一样使用！

---

## 📚 相关文档

- [APK打包指南.md](APK打包指南.md) - 详细打包教程
- [APK一键打包-超级简单版.md](APK一键打包-超级简单版.md) - 超简单方案
- [APP使用教程.md](APP使用教程.md) - APP使用说明

---

## ⚠️ 前提条件

如果选择方法一或二，需要安装：
- Node.js (已安装)
- JDK 17+
- Android Studio

如果选择方法三，不需要任何额外安装！

