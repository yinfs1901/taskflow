import { create } from 'zustand'
import type { Task, Category, Tag, TaskCreateInput, TaskUpdateInput, FilterType } from '../types'

const api = window.api

interface TaskStore {
  tasks: Task[]
  categories: Category[]
  tags: Tag[]
  activeFilter: FilterType
  activeCategoryId: string | null
  selectedTaskId: string | null
  selectedTask: Task | null   // full task for detail panel
  searchQuery: string
  orderBy: string
  pageSize: number
  currentPage: number

  // Actions
  loadTasks: () => Promise<void>
  loadCategories: () => Promise<void>
  loadTags: () => Promise<void>
  createTask: (input: TaskCreateInput) => Promise<void>
  updateTask: (id: string, updates: TaskUpdateInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setFilter: (filter: FilterType) => void
  setCategory: (categoryId: string | null) => void
  selectTask: (id: string | null) => void
  setSearch: (query: string) => void
  setOrderBy: (orderBy: string) => Promise<void>
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  createCategory: (name: string, color: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  createTag: (name: string, color: string) => Promise<void>
  deleteTag: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  categories: [],
  tags: [],
  activeFilter: 'task_library',
  activeCategoryId: null,
  selectedTaskId: null,
  selectedTask: null,
  searchQuery: '',
  orderBy: 'deadline ASC',
  pageSize: 20,
  currentPage: 1,

  loadTasks: async () => {
    const { activeFilter, activeCategoryId, searchQuery, orderBy } = get()
    const filters: any = { orderBy }
    if (activeFilter === 'today') filters.today = true
    else if (activeFilter === 'important') filters.important = true
    else if (activeFilter === 'done') filters.status = 'done'
    else if (activeFilter === 'cancelled') filters.status = 'cancelled'
    else if (activeFilter === 'task_library') filters.task_library = true
    if (activeFilter === 'category' && activeCategoryId) filters.category_id = activeCategoryId
    if (searchQuery) filters.search = searchQuery
    const tasks = await api.taskList(filters)
    set({ tasks, currentPage: 1 })
  },

  loadCategories: async () => {
    const categories = await api.categoryList()
    set({ categories })
  },

  loadTags: async () => {
    const tags = await api.tagList()
    set({ tags })
  },

  createTask: async (input) => {
    await api.taskCreate(input)
    await get().loadTasks()
  },

  updateTask: async (id, updates) => {
    await api.taskUpdate(id, updates)
    // Refresh selectedTask from DB so detail panel always has current data
    const updated = await api.taskList({ id })
    set({ selectedTask: updated && updated.length > 0 ? updated[0] : null })
    await get().loadTasks()
  },

  deleteTask: async (id) => {
    await api.taskDelete(id)
    set({ selectedTaskId: null, selectedTask: null })
    await get().loadTasks()
  },

  setFilter: (filter) => {
    set({ activeFilter: filter, activeCategoryId: null, selectedTaskId: null, selectedTask: null })
    get().loadTasks()
  },

  setCategory: (categoryId) => {
    set({ activeFilter: 'category', activeCategoryId: categoryId, selectedTaskId: null, selectedTask: null })
    get().loadTasks()
  },

  selectTask: async (id) => {
    if (!id) {
      set({ selectedTaskId: null, selectedTask: null })
      return
    }
    const tasks = await api.taskList({ id })
    const task = tasks && tasks.length > 0 ? tasks[0] : null
    set({ selectedTaskId: id, selectedTask: task })
  },

  setSearch: (query) => {
    set({ searchQuery: query })
    get().loadTasks()
  },

  setOrderBy: async (orderBy) => {
    set({ orderBy })
    await get().loadTasks()
  },

  createCategory: async (name, color) => {
    await api.categoryCreate({ name, color })
    await get().loadCategories()
  },

  deleteCategory: async (id) => {
    await api.categoryDelete(id)
    await get().loadCategories()
    await get().loadTasks()
  },

  createTag: async (name, color) => {
    await api.tagCreate({ name, color })
    await get().loadTags()
  },

  deleteTag: async (id) => {
    await api.tagDelete(id)
    await get().loadTags()
    await get().loadTasks()
  },

  setPage: (page) => {
    set({ currentPage: page })
  },

  setPageSize: (size) => {
    set({ pageSize: size, currentPage: 1 })
  },
}))
