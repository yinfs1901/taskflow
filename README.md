# TaskFlow

个人任务管理桌面应用，基于 Electron + React + SQLite 构建。

## 功能

- **任务管理** — 创建、编辑、删除任务，支持标题/描述/优先级/截止日期/分类/标签
- **子任务** — 任务可拆分为多级子任务，带进度条展示完成比例
- **任务领用** — 待办任务可领用进入「进行中」，支持驳回释放
- **多视图筛选** — 任务库、我的任务、今天到期、重要、已完成、按分类
- **日历视图** — 年/月/周三种维度，按任务状态自动锚定时间（进行中→领用时间，已完成→完成时间，待办→截止日期）
- **周报** — 自动生成周度统计，含每日趋势图和分类/优先级分布
- **深色主题** — Catppuccin Mocha 配色

## 技术栈

| 层 | 技术 |
|---|---|
| 桌面框架 | Electron 28 |
| 前端 | React + TypeScript + Vite |
| 样式 | Tailwind CSS |
| 状态管理 | Zustand |
| 数据库 | better-sqlite3（本地 SQLite） |
| 日期处理 | dayjs |

## 项目结构

```
task/
├── electron/
│   ├── main.js          # Electron 主进程，SQLite 初始化与 IPC
│   └── preload.js       # contextBridge 暴露 API
├── src/
│   ├── components/
│   │   ├── CalendarView.tsx   # 日历（年/月/周）
│   │   ├── Sidebar.tsx        # 侧边栏导航
│   │   ├── TaskCreateModal.tsx # 新建任务弹窗
│   │   ├── TaskDetail.tsx     # 任务详情面板
│   │   ├── TaskItem.tsx       # 任务卡片
│   │   ├── TaskList.tsx       # 任务列表
│   │   └── WeeklyReport.tsx   # 周报
│   ├── stores/
│   │   └── taskStore.ts       # Zustand 状态
│   ├── types/
│   │   └── index.ts           # TypeScript 类型定义
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 数据模型

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',       -- todo / in_progress / done
  priority TEXT DEFAULT 'medium',   -- low / medium / high / urgent
  deadline TEXT,
  category_id TEXT,
  owner_id TEXT,                    -- 领用人
  accepted_at TEXT,                 -- 领用时间
  completed_at TEXT,                -- 完成时间
  parent_id TEXT,                   -- 父任务（自引用，支持子任务）
  created_at TEXT,
  updated_at TEXT
);
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发模式
npm run dev

# 生产构建
npm run build
```

## 许可

MIT
