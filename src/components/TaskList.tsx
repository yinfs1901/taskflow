import { useTaskStore } from '../stores/taskStore'
import TaskItem from './TaskItem'
import TaskCreateModal from './TaskCreateModal'
import { Plus, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { LibraryStatusFilter } from '../types'
import { useState } from 'react'

const sortOptions = [
  { value: 'deadline ASC', label: '截止时间' },
  { value: 'priority DESC', label: '优先级' },
  { value: 'created_at DESC', label: '创建时间' },
  { value: 'updated_at DESC', label: '更新时间' },
]

const filterLabels: Record<string, string> = {
  task_library: '任务库',
  my_tasks: '我的任务',
  today: '今天到期',
  important: '重要',
  done: '已完成',
  category: '分类',
}

const libraryStatusOptions: { value: LibraryStatusFilter; label: string }[] = [
  { value: 'todo', label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done', label: '已完成' },
  { value: 'all', label: '所有' },
]

export default function TaskList() {
  const { tasks, activeFilter, activeCategoryId, categories, selectedTaskId, selectTask, orderBy, setOrderBy, currentPage, pageSize, setPage, setPageSize, libraryStatus, setLibraryStatus } = useTaskStore()
  const [showSort, setShowSort] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filterLabel = activeFilter === 'category'
    ? categories.find(c => c.id === activeCategoryId)?.name || '分类'
    : filterLabels[activeFilter]

  const showLibraryTabs = activeFilter === 'task_library'

  const totalPages = Math.ceil(tasks.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const visibleTasks = tasks.slice(startIndex, startIndex + pageSize)

  return (
    <main className="flex-1 flex flex-col bg-[#1e1e2e] min-w-0">
      {/* Header */}
      <div className="flex flex-col border-b border-[#313244]">
        <div className="flex items-center justify-between px-6 py-3">
          <h2 className="text-lg font-semibold text-[#cdd6f4]">{filterLabel}</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-1 px-2 py-1 rounded text-sm text-[#a6adc8] hover:bg-[#313244] hover:text-[#cdd6f4]"
              >
                <ArrowUpDown size={14} />
                排序
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 bg-[#313244] border border-[#45475a] rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setOrderBy(opt.value); setShowSort(false) }}
                      className={`w-full text-left px-3 py-1.5 text-sm ${orderBy === opt.value ? 'text-[#89b4fa]' : 'text-[#a6adc8] hover:bg-[#45475a]'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {activeFilter === 'task_library' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#89b4fa] text-[#1e1e2e] rounded-lg text-sm font-medium hover:bg-[#74c7ec] transition-colors"
              >
                <Plus size={14} />
                新建
              </button>
            )}
          </div>
        </div>
        {showLibraryTabs && (
          <div className="flex items-center gap-1 px-6 pb-2">
            {libraryStatusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setLibraryStatus(opt.value)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  libraryStatus === opt.value
                    ? 'bg-[#89b4fa] text-[#1e1e2e] font-medium'
                    : 'text-[#a6adc8] hover:bg-[#313244] hover:text-[#cdd6f4]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#6c7086]">
            <InboxIcon />
            <p className="mt-2 text-sm">暂无任务</p>
          </div>
        ) : (
          visibleTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={() => selectTask(task.id)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#313244] text-sm">
          <div className="flex items-center gap-2 text-[#6c7086]">
            <span>每页</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-[#313244] border border-[#45475a] rounded px-2 py-1 text-[#cdd6f4] outline-none"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>条</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6c7086]">
              第 {currentPage} / {totalPages} 页，共 {tasks.length} 条
            </span>
            <button
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-[#313244] disabled:opacity-30 disabled:cursor-not-allowed text-[#a6adc8]"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-[#313244] disabled:opacity-30 disabled:cursor-not-allowed text-[#a6adc8]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <TaskCreateModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </main>
  )
}

function InboxIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}
