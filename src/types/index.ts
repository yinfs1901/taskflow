export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
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
  assignees: Assignee[]
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
  tag_ids?: string[]
  assignees?: Assignee[]
}

export interface TaskUpdateInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: string | null
  category_id?: string | null
  tag_ids?: string[]
  assignees?: Assignee[]
}

export type FilterType = 'all' | 'task_library' | 'today' | 'important' | 'done' | 'cancelled' | 'category'
