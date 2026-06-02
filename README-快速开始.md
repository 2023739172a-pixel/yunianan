# 🚀 APK一键构建指南

## 📋 快速开始

### 方案一：GitHub Actions 自动构建（推荐，无需本地环境）

#### Step 1: 将代码推送到GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

#### Step 2: 触发自动构建
1. 打开你的GitHub仓库
2. 点击 "Actions" 标签
3. 选择 "Build APK" 工作流
4. 点击 "Run workflow" 按钮
5. 等待构建完成（约10-15分钟）

#### Step 3: 下载APK
1. 构建完成后，点击该工作流详情页
2. 底部 "Artifacts" 区域找到 "app-debug"
3. 点击下载即可

---

### 方案二：本地一键构建

#### Windows 用户

1. **确保已安装必要工具：
   - Node.js v18+
   - JDK 17+
   - Git

2. **打开终端或PowerShell，执行：
```bash
cd 你的项目目录
npm install
npm run build
npx cap sync android
cd android
chmod +x gradlew  # Windows上可能不需要
./gradlew assembleDebug
```

3. **APK位置：`android/app/build/outputs/apk/debug/app-debug.apk`

#### Mac/Linux 用户

```bash
cd 你的项目目录
npm install
npm run build
npx cap sync android
cd android
chmod +x gradlew
./gradlew assembleDebug
```

---

## 📦 项目已准备完毕！

### ✅ 已完成的优化

| 项目 | 状态 | 说明 |
|------|------|------|
| Web应用构建 | ✅ 完成 | dist目录已生成 |
| Android项目配置 | ✅ 完成 | android目录已就绪 |
| GitHub Actions配置 | ✅ 完成 | 一键自动构建 |
| Maven镜像配置 | ✅ 完成 | 阿里云加速 |

---

## 🎯 推荐使用方案一（GitHub Actions）

### 详细步骤：

1. **注册/登录 GitHub
   - 访问 https://github.com
   - 没有账号？注册一个（免费）

2. **创建新仓库**
   - 点击右上角 "+" → "New repository"
   - 填写仓库名称（如：ai-answer-app）
   - 选择 Public/Private都可以

3. **推送到GitHub**
   ```bash
   # 初始化Git仓库（如果还没有）
   cd /workspace
   git init
   git add .
   git commit -m "First commit: AI Answer App"
   
   # 添加远程仓库（替换你的用户名和仓库名）
   git remote add origin https://github.com/你的用户名/ai-answer-app.git
   
   # 推送
   git branch -M main
   git push -u origin main
   ```

4. **自动构建开始！
   - 推送后，GitHub Actions自动开始构建
   - 查看 Actions 标签页查看进度

5. **下载APK
   - 构建完成后，在Artifacts下载

---

## 🔧 本地环境准备（如果选择本地构建）

### 检查环境检查清单

- **Node.js 20** → https://nodejs.org/
- **JDK 17** → https://adoptium.net/
- **Git** → https://git-scm.com/

## 🎉 就这么简单！

---

## 💡 提示

- **首次GitHub构建**：无需安装任何东西，推送到GitHub即可！
- **本地构建**：需要安装上述工具，速度更快

**推荐使用 GitHub Actions，简单又省心！
