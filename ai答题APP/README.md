# AI 答题助手

一个功能完整的 AI 答题搜索工具，支持从豆包、千问、元宝等多个平台获取答案，提供数据清洗、去重、对比和可视化功能。

## 功能特性

- 🔍 **多平台搜索** - 一次搜索，获取多个 AI 平台的答案
- 📊 **智能对比** - 自动评分排序，找到最优回答
- 📈 **数据可视化** - 直观图表展示各平台表现
- 💻 **命令行工具** - 支持 CLI 批量查询和数据导出
- 🌐 **Web 界面** - 简洁美观的用户界面

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS
- **后端**: Express.js + TypeScript
- **图表**: Chart.js
- **构建工具**: Vite

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev

# 或者单独启动
npm run server:dev  # 后端 (端口 5000)
npm run client:dev  # 前端 (端口 5173)
```

### 使用命令行工具

```bash
# 使用示例数据
npm run cli:sample

# 搜索问题
npm run cli search -- --keyword "什么是人工智能"

# 指定平台
npm run cli search -- --keyword "什么是人工智能" --platforms doubao qianwen

# 导出结果到文件
npm run cli search -- --keyword "什么是人工智能" --output result.json

# 查看可用平台
npm run cli platforms
```

## 项目结构

```
.
├── src/                  # 前端代码
│   ├── App.tsx          # 主应用组件
│   └── main.tsx         # 入口文件
├── backend.ts           # 后端 API 服务
├── cli.ts               # 命令行工具
├── types.ts             # 共享类型定义
├── index.html           # HTML 入口
├── vite.config.ts       # Vite 配置
└── package.json         # 项目依赖
```

## API 接口

### 搜索答案

```
POST /api/search
Content-Type: application/json

{
  "keyword": "什么是人工智能？",
  "platforms": ["doubao", "qianwen", "yuanbao"]
}
```

### 示例数据

```
GET /api/search/sample
```

### 健康检查

```
GET /api/health
```

## 支持的平台

- 🟢 **豆包** (doubao) - https://www.doubao.com
- 🟠 **千问** (qianwen) - https://qianwen.aliyun.com
- 🔵 **元宝** (yuanbao) - https://yuanbao.tencent.com

## 构建生产版本

```bash
npm run build
```

## 许可证

MIT
