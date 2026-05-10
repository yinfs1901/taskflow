import type { TaskPriority, TaskStatus } from './types'

export interface PriorityOption {
  value: TaskPriority
  label: string
  color: string
}

export interface StatusOption {
  value: TaskStatus
  label: string
  color: string
}

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: 'low', label: '低', color: '#a6e3a1' },
  { value: 'medium', label: '中', color: '#f9e2af' },
  { value: 'high', label: '高', color: '#fab387' },
  { value: 'urgent', label: '紧急', color: '#f38ba8' },
]

export const STATUS_OPTIONS: StatusOption[] = [
  { value: 'todo', label: '待办', color: '#6c7086' },
  { value: 'in_progress', label: '进行中', color: '#89b4fa' },
  { value: 'done', label: '已完成', color: '#a6e3a1' },
]

export const PRIORITY_MAP: Record<string, PriorityOption> =
  Object.fromEntries(PRIORITY_OPTIONS.map((p) => [p.value, p]))

export const STATUS_MAP: Record<string, StatusOption> =
  Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]))

export const CALENDAR_STATUS_COLORS: Record<string, string> = {
  todo: '#89dceb',
  in_progress: '#cba6f7',
  done: '#a6e3a1',
}