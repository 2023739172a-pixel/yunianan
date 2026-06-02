
# 📱 学习通签到功能 - 产品需求文档

## 1. 需求概述

为 AI 答题助手 APP 添加学习通（超星泛雅）签到功能，包括：
- 学习通账号登录
- 虚拟定位签到
- 扫码签到
- 二维码扫描与分享

## 2. 功能需求

### 2.1 学习通登录

| 功能点 | 描述 | 优先级 |
|--------|------|--------|
| 账号密码登录 | 输入学习通账号密码登录 | 高 |
| 自动登录 | 记住密码，下次自动登录 | 高 |
| 登录状态管理 | 保持登录状态，显示用户名 | 高 |
| 退出登录 | 清除登录信息 | 中 |

### 2.2 虚拟定位签到

| 功能点 | 描述 | 优先级 |
|--------|------|--------|
| 定位模拟 | 手动输入或选择位置进行签到 | 高 |
| 位置搜索 | 搜索地点并设置为签到位置 | 高 |
| 历史位置 | 保存常用签到位置 | 中 |
| 一键签到 | 快速使用上次位置签到 | 高 |

### 2.3 扫码签到

| 功能点 | 描述 | 优先级 |
|--------|------|--------|
| 扫码识别 | 扫描老师发布的签到二维码 | 高 |
| 自动签到 | 识别二维码后自动完成签到 | 高 |
| 签到记录 | 显示历史签到记录 | 中 |

### 2.4 二维码扫描与分享

| 功能点 | 描述 | 优先级 |
|--------|------|--------|
| 二维码扫描 | 使用摄像头扫描二维码 | 高 |
| 图片识别 | 支持从相册选择图片识别 | 中 |
| 生成二维码 | 将签到信息生成二维码分享 | 中 |

## 3. 页面设计

### 3.1 签到首页

- 顶部：学习通登录状态
- 功能区：虚拟定位签到、扫码签到、二维码扫描
- 底部：签到记录

### 3.2 登录页面

- 学习通账号输入
- 密码输入（支持显示/隐藏）
- 记住密码选项
- 登录按钮

### 3.3 虚拟定位签到页面

- 位置搜索框
- 历史位置列表
- 手动输入经纬度（高级功能）
- 签到按钮

### 3.4 扫码签到页面

- 摄像头预览区域
- 扫码提示
- 签到结果显示

## 4. 交互流程

```
首页 → 选择签到方式 → 执行签到 → 显示结果 → 返回首页
```

## 5. 数据需求

| 数据项 | 来源 | 说明 |
|--------|------|------|
| 学习通账号信息 | 用户输入 | 账号、密码（加密存储） |
| 签到位置 | 用户设置 | 位置名称、经纬度 |
| 签到记录 | 本地存储 | 签到时间、课程、状态 |

---

# 🛠 技术架构文档

## 1. 技术选型

- **前端框架**: React + TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **状态管理**: React Hooks (useState, useContext)
- **存储**: localStorage

## 2. 目录结构

```
src/
├── components/
│   ├── SignIn/           # 学习通登录组件
│   │   └── index.tsx
│   ├── LocationSign/     # 虚拟定位签到组件
│   │   └── index.tsx
│   ├── QRScan/           # 扫码签到组件
│   │   └── index.tsx
│   └── QRCode/           # 二维码生成组件
│       └── index.tsx
├── pages/
│   └── CheckInPage.tsx   # 签到页面
├── context/
│   └── AuthContext.tsx   # 登录状态管理
├── utils/
│   └── checkin.ts        # 签到工具函数
├── types/
│   └── checkin.ts        # 类型定义
└── App.tsx               # 主应用
```

## 3. API 设计

### 3.1 学习通登录

```typescript
interface LoginResponse {
  success: boolean;
  message: string;
  userInfo?: UserInfo;
}

interface UserInfo {
  userId: string;
  userName: string;
  avatar?: string;
}

async function login(username: string, password: string): Promise<LoginResponse>
async function logout(): void
function isLoggedIn(): boolean
function getUserInfo(): UserInfo | null
```

### 3.2 签到功能

```typescript
interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface CheckInRecord {
  id: string;
  courseName: string;
  type: 'location' | 'qr';
  time: string;
  status: 'success' | 'failed';
  location?: Location;
}

async function locationCheckIn(location: Location): Promise<CheckInRecord>
async function qrCheckIn(qrCode: string): Promise<CheckInRecord>
function getCheckInHistory(): CheckInRecord[]
function saveLocation(name: string, lat: number, lng: number): void
function getSavedLocations(): Location[]
```

## 4. 状态管理

使用 React Context 管理登录状态：

```typescript
interface AuthContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
```

## 5. 安全性考虑

- 密码加密存储（使用 localStorage + Base64）
- API 请求使用 HTTPS
- 敏感信息不打印到控制台
- 定期清理过期登录状态

