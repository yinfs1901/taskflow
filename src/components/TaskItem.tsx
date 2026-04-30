import { useTaskStore } from '../stores/taskStore'
import type { Task } from '../types'
import { Circle, CheckCircle2, Clock, Flag } from 'lucide-react'
import dayjs from 'dayjs'

const statusIcons: Record<string, typeof Circle> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
  cancelled: Circle,
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: '紧急', color: '#f38ba8' },
  high: { label: '高', color: '#fab387' },
  medium: { label: '中', color: '#f9e2af' },
  low: { label: '低', color: '#a6e3a1' },
}

interface Props {
  task: Task
  isSelected: boolean
  onSelect: () => void
}

export default function TaskItem({ task, isSelected, onSelect }: Props) {
  const { updateTask } = useTaskStore()
  const StatusIcon = statusIcons[task.status] || Circle
  const prio = priorityConfig[task.priority] || priorityConfig.medium
  const isOverdue = task.deadline && dayjs(task.deadline).isBefore(dayjs(), 'day') && task.status !== 'done'

  const handleToggleDone = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
  }

  return (
    <div
      onClick={onSelect}
      className={`group flex items-start gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${
        isSelected
          ? 'bg-[#313244] ring-1 ring-[#89b4fa]/30'
          : 'hover:bg-[#313244]/50'
      }`}
    >
      {/* Status toggle */}
      <button onClick={handleToggleDone} className="mt-0.5 flex-shrink-0">
        {task.status === 'done' ? (
          <CheckCircle2 size={18} className="text-[#a6e3a1]" />
        ) : task.status === 'in_progress' ? (
          <Clock size={18} className="text-[#89b4fa]" />
        ) : (
          <Circle size={18} className="text-[#6c7086] hover:text-[#a6adc8]" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${task.status === 'done' ? 'line-through text-[#6c7086]' : 'text-[#cdd6f4]'}`}>
          {task.title}
        </div>
        <div className="flex items-center gap-3 mt-1">
          {/* Priority */}
          <span className="flex items-center gap-1">
            <Flag size={12} style={{ color: prio.color }} />
            <span className="text-xs" style={{ color: prio.color }}>{prio.label}</span>
          </span>

          {/* Deadline */}
          {task.deadline && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'overdue' : 'text-[#6c7086]'}`}>
              <Clock size={11} />
              {dayjs(task.deadline).format('MM-DD')}
            </span>
          )}

          {/* Tags */}
          {task.tags.map(tag => (
            <span
              key={tag.id}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}
            >
              {tag.name}
            </span>
          ))}

          {/* Category */}
          {task.category_name && (
            <span className="text-xs text-[#6c7086]">
              📁 {task.category_name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
