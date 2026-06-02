# AI 答题助手 APP 技术架构

## 1. 技术栈

- **前端**: React 18 + TypeScript + TailwindCSS
- **移动端**: PWA (Progressive Web App) + Service Worker
- **状态管理**: React Context API
- **本地存储**: localStorage + IndexedDB
- **后端**: Express.js (保持不变)

## 2. 核心模块

### 2.1 移动端适配模块
- 使用 Tailwind 的响应式断点 (sm:, md:, lg:)
- 触摸友好的组件设计
- 虚拟键盘适配
- 横竖屏布局优化

### 2.2 悬浮窗组件
- 可拖拽的悬浮组件
- 独立的 z-index 层级
- 迷你搜索界面
- 与主应用通信

### 2.3 连续答题引擎
- 任务队列管理
- 自动搜索调度
- 进度状态管理
- 历史记录存储

## 3. 数据结构

### 答题历史
```typescript
interface HistoryItem {
  id: string
  question: string
  answers: Answer[]
  timestamp: number
  favorite: boolean
}
```

### 连续答题任务
```typescript
interface Task {
  id: string
  questions: string[]
  currentIndex: number
  status: 'idle' | 'running' | 'paused' | 'completed'
  results: HistoryItem[]
}
```
