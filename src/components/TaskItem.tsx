import { memo, useState } from 'react'
import { useTaskStore } from '../stores/taskStore'
import type { Task } from '../types'
import { Circle, CheckCircle2, Clock, Flag } from 'lucide-react'
import { PRIORITY_OPTIONS } from '../constants'
import dayjs from 'dayjs'

const priorityMap = Object.fromEntries(PRIORITY_OPTIONS.map(p => [p.value, p]))

interface Props {
  task: Task
  isSelected: boolean
  onSelect: () => void
}

function TaskItem({ task, isSelected, onSelect }: Props) {
  const { updateTask } = useTaskStore()
  const prio = priorityMap[task.priority] || priorityMap.medium
  const isOverdue = task.deadline && dayjs(task.deadline).isBefore(dayjs(), 'day') && task.status !== 'done'

  // 子任务进度
  const childDone = task.children_count ? Math.round((task.children_done || 0) / task.children_count * 100) : 0
  const hasChildren = (task.children_count || 0) > 0

  const handleToggleDone = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
  }

  return (
    <div
      onClick={onSelect}
      className={`group p-4 rounded-xl cursor-pointer transition-all mb-2.5 ${
        isSelected
          ? 'bg-[#313244] ring-1 ring-[#89b4fa]/40 shadow-lg'
          : 'bg-[#1e1e2e] hover:bg-[#313244]/60 hover:ring-1 hover:ring-[#45475a]/50'
      }`}
    >
      {/* 第一行：勾选 + 标题 */}
      <div className="flex items-center gap-3">
        {/* 圆形勾选框 */}
        <button
          onClick={handleToggleDone}
          className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
          style={{
            borderColor: task.status === 'done' ? '#a6e3a1' : task.status === 'in_progress' ? '#89b4fa' : '#6c7086',
            backgroundColor: task.status === 'done' ? '#a6e3a1' : 'transparent',
          }}
        >
          {task.status === 'done' && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="#1e1e2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
          {task.status === 'in_progress' && (
            <div className="w-2 h-2 rounded-full bg-[#1e1e2e]" />
          )}
        </button>

        {/* 标题 */}
        <span className={`text-[15px] font-medium leading-tight ${
          task.status === 'done' ? 'line-through text-[#585b70]' : 'text-[#cdd6f4]'
        }`}>
          {task.title}
        </span>
      </div>

      {/* 第二行：元信息 */}
      <div className="flex items-center gap-3 mt-2 ml-8">
        {/* 优先级 */}
        <span className="flex items-center gap-1">
          <Flag size={12} style={{ color: prio.color }} />
          <span className="text-xs" style={{ color: prio.color }}>{prio.label}</span>
        </span>

        {/* 截止日期 */}
        {task.deadline && (
          <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-[#f38ba8]' : 'text-[#6c7086]'}`}>
            <Clock size={11} />
            {dayjs(task.deadline).format('MM-DD')}
          </span>
        )}

        {/* 子任务进度条 */}
        {hasChildren && (
          <div className="flex items-center gap-1.5 flex-1 max-w-[100px]">
            <div className="flex-1 h-1.5 bg-[#313244] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#89b4fa] rounded-full transition-all"
                style={{ width: `${childDone}%` }}
              />
            </div>
            <span className="text-[10px] text-[#6c7086] whitespace-nowrap">
              {task.children_done || 0}/{task.children_count}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(TaskItem)
