# 🚀 一键构建APK - 操作指南

## 📋 项目已准备好！

代码已成功提交到本地git仓库，现在需要您在GitHub上创建仓库。

---

## 🔧 第1步：在GitHub上创建仓库

1. **打开GitHub：https://github.com
2. **点击右上角 "+" → "New repository"
3. **填写信息：
   - Repository name: `yunianan` （或者您喜欢的名称）
   - Public/Private: 选哪个都可以
   - ❌ **不要**勾选 "Initialize this repository with a README"
   - ❌ **不要**添加 .gitignore
   - ❌ **不要**添加 license
4. **点击 "Create repository"

---

## 💻 第2步：推送代码到GitHub（请复制粘贴这些命令）

复制并在终端/命令行执行：

```bash
cd /workspace
git remote add origin https://github.com/yunianan/yunianan.git
git push -u origin main
```

**注意：** 如果您的仓库名称不是 `yunianan`，请把上面的 `yunianan/yunianan.git` 替换为 `你的用户名/你的仓库名.git`

---

## 🎉 第3步：自动构建APK！

推送成功后，GitHub Actions会**自动开始构建**：

1. **打开您的GitHub仓库页面
2. **点击顶部的 "Actions" 标签
3. **您会看到 "Build APK" 工作流正在运行
4. **等待 10-15 分钟，构建完成！

---

## 📥 第4步：下载APK

构建完成后：

1. 在该Actions工作流详情页底部
2. **找到 "Artifacts" 区域
3. **点击下载 `app-debug`
4. **解压后就能得到 `app-debug.apk` 了！

---

## 💡 提示

- 如果GitHub Actions没有自动运行，请点击 "Actions" → "Build APK" → "Run workflow" 手动触发
- 首次构建需要下载依赖，后续会更快
