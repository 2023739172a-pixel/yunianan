# 📦 AI答题助手 - 复制项目到D盘指南

## 🔍 方法一：从GitHub下载（最简单）

### 前置条件
如果您已经将代码推送到GitHub，请使用此方法。

### 步骤

1. **访问您的GitHub仓库**
   - 网址：https://github.com/您的用户名/您的仓库名

2. **下载项目**
   - 点击绿色 "Code" 按钮
   - 选择 "Download ZIP"

3. **解压到D盘**
   - 下载的ZIP文件解压到：`D:\AI答题助手`
   - 最终目录结构：`D:\AI答题助手\src\`, `D:\AI答题助手\android\` 等

---

## 🛠️ 方法二：手动复制文件（如果有访问权限）

### 如果您可以在当前环境中操作：

#### 方式A：使用共享文件夹
1. 检查是否有挂载的共享文件夹
2. 将 `/workspace/` 复制到共享文件夹
3. 在Windows中从共享文件夹复制到D盘

#### 方式B：使用文件传输工具
1. 用FTP/SFTP/SCP等工具连接到服务器
2. 下载 `/workspace/` 目录
3. 解压到 `D:\AI答题助手`

---

## 🎯 方法三：手动创建项目结构（最可控）

如果以上方法都不可用，可以手动创建项目：

### 步骤1：创建目录结构

在D盘创建文件夹：
```
D:\AI答题助手\
```

### 步骤2：下载关键文件清单

需要创建/复制以下文件和目录：

```
D:\AI答题助手\
├── src/                          ← 复制前端源码
├── android/                      ← 复制Android项目
├── public/                       ← 复制公共文件
├── dist/                         ← 复制Web构建产物
│
├── package.json                  ← 复制
├── package-lock.json             ← 复制
├── vite.config.ts               ← 复制
├── tsconfig.json                 ← 复制
├── tailwind.config.js            ← 复制
├── postcss.config.js             ← 复制
├── index.html                   ← 复制
├── capacitor.config.json        ← 复制
├── backend.ts                   ← 复制
├── types.ts                     ← 复制
├── cli.ts                       ← 复制
├── vercel.json                  ← 复制
├── nodemon.json                 ← 复制
├── eslint.config.js             ← 复制
├── .gitignore                   ← 复制
│
├── AI答题助手-APK构建工具.bat    ← ⭐ 复制（一键构建）
├── 快速构建.bat                  ← 复制
├── 环境检查工具.bat              ← 复制
├── 本地APK构建指南.md            ← 复制
├── README-APK构建包.md          ← 复制
│
└── 其他文档文件...
```

### 步骤3：创建构建脚本

#### 1. AI答题助手-APK构建工具.bat
（完整内容见项目根目录的文件）

#### 2. 快速构建.bat
（完整内容见项目根目录的文件）

#### 3. 环境检查工具.bat
（完整内容见项目根目录的文件）

---

## ✅ 项目就绪后

### 1. 检查环境

双击运行：`环境检查工具.bat`

### 2. 开始构建

双击运行：`AI答题助手-APK构建工具.bat`

### 3. 获取APK

构建完成后，APK位于：
```
D:\AI答题助手\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 💡 提示

1. **node_modules不需要复制** - 运行 `npm install` 时会自动下载
2. **.git 不需要复制** - 这是Git历史记录，不影响构建
3. **首次构建需要网络** - 下载Gradle、Android SDK等依赖

---

## 📞 如果需要帮助

1. 参考 `本地APK构建指南.md`
2. 检查环境是否符合要求
3. 确保网络连接正常

---

**祝您成功构建APK！🎉**
