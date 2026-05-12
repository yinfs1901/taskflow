import type { Task, Category, Tag, TaskCreateInput, TaskUpdateInput, WeeklyReportData } from './types'

export {}

declare global {
  interface Window {
    api: {
      taskList: (filters?: Record<string, unknown>) => Promise<Task[]>
      taskCreate: (task: TaskCreateInput) => Promise<Task>
      taskUpdate: (id: string, updates: TaskUpdateInput) => Promise<Task>
      taskDelete: (id: string) => Promise<{ success: boolean }>
      taskCalendar: (filters?: { year?: number; month?: number }) => Promise<Task[]>
      weeklyReport: (weekStart: string) => Promise<WeeklyReportData>

      categoryList: () => Promise<Category[]>
      categoryCreate: (cat: { name: string; color: string }) => Promise<Category>
      categoryUpdate: (id: string, updates: { name?: string; color?: string }) => Promise<Category>
      categoryDelete: (id: string) => Promise<{ success: boolean }>

      tagList: () => Promise<Tag[]>
      tagCreate: (tag: { name: string; color: string }) => Promise<Tag>
      tagDelete: (id: string) => Promise<{ success: boolean }>
      taskCounts: () => Promise<{ my_tasks: number; today: number; important: number; done: number }>
    }
  }
}
