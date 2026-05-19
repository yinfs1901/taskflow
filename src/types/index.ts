export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Category {
  id: string
  name: string
  color: string
  sort_order: number
}

export interface Assignee {
  name: string
  ratio: number  // percentage, e.g. 50 means 50%
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  deadline: string | null
  category_id: string | null
  category_name?: string
  category_color?: string
  tags: Tag[]
  owner_id: string | null  // 领用人ID
  accepted_at: string | null  // 领用时间
  completed_at: string | null  // 实际完成时间
  parent_id?: string | null  // 父任务ID
  parent_title?: string  // 父任务标题（查询时附带）
  children_count?: number  // 子任务数量（查询时计算）
  children_done?: number  // 已完成子任务数（查询时计算）
  created_at: string
  updated_at: string
}

export interface TaskCreateInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: string | null
  category_id?: string | null
  parent_id?: string | null
  tag_ids?: string[]
}

export interface TaskUpdateInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: string | null
  category_id?: string | null
  tag_ids?: string[]
  owner_id?: string | null
  accepted_at?: string | null
  completed_at?: string | null
}

export type FilterType = 'task_library' | 'my_tasks' | 'today' | 'important' | 'done' | 'category' | 'calendar' | 'weekly_report'
export type LibraryStatusFilter = 'all' | 'todo' | 'in_progress' | 'done'

export interface WeeklyReportData {
  weekStart: string
  weekEnd: string
  summary: {
    created: number
    completed: number
    inProgress: number
    overdue: number
  }
  dailyStats: { date: string; created: number; completed: number; inProgress: number }[]
  categoryStats: { name: string; color: string; total: number; done: number }[]
  priorityStats: { priority: string; count: number }[]
  createdTasks: Task[]
  completedTasks: Task[]
  inProgressTasks: Task[]
}
