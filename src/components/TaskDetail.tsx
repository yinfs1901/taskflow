import { useTaskStore } from '../stores/taskStore'
import { X, Flag, Calendar, Tag, Folder, Users, Plus, Trash2, Ban } from 'lucide-react'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import type { TaskPriority, TaskStatus, Assignee } from '../types'

const priorities: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: '低', color: '#a6e3a1' },
  { value: 'medium', label: '中', color: '#f9e2af' },
  { value: 'high', label: '高', color: '#fab387' },
  { value: 'urgent', label: '紧急', color: '#f38ba8' },
]

const statuses: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: '待办', color: '#6c7086' },
  { value: 'in_progress', label: '进行中', color: '#89b4fa' },
  { value: 'done', label: '已完成', color: '#a6e3a1' },
  { value: 'cancelled', label: '已取消', color: '#45475a' },
]

export default function TaskDetail() {
  const { selectedTaskId, selectedTask, categories, tags, updateTask, deleteTask, selectTask } = useTaskStore()
  const task = selectedTask

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignees, setAssignees] = useState<Assignee[]>([])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setAssignees(task.assignees || [])
    }
  }, [task?.id])

  if (!task || task.id !== selectedTaskId) {
    return (
      <aside className="w-80 flex-shrink-0 bg-[#181825] border-l border-[#313244] flex items-center justify-center">
        <p className="text-sm text-[#6c7086]">选择一个任务查看详情</p>
      </aside>
    )
  }

  const isOverdue = task.deadline && dayjs(task.deadline).isBefore(dayjs(), 'day')
    && task.status !== 'done' && task.status !== 'cancelled'

  const handleTitleBlur = () => {
    if (title.trim() && title !== task!.title) {
      updateTask(task!.id, { title: title.trim() })
    }
  }

  const handleDescBlur = () => {
    if (description !== task!.description) {
      updateTask(task!.id, { description })
    }
  }

  const handleDelete = () => {
    deleteTask(task!.id)
  }

  const handleCancel = () => {
    updateTask(task!.id, { status: 'cancelled' })
  }

  const handleToggleTag = (tagId: string) => {
    const currentTagIds = task!.tags.map(t => t.id)
    const newTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter(id => id !== tagId)
      : [...currentTagIds, tagId]
    updateTask(task!.id, { tag_ids: newTagIds })
  }

  const addAssignee = () => {
    setAssignees(prev => [...prev, { name: '', ratio: 0 }])
  }

  const removeAssignee = (index: number) => {
    const next = assignees.filter((_, i) => i !== index)
    setAssignees(next)
    updateTask(task!.id, { assignees: next })
  }

  const updateAssignee = (index: number, field: 'name' | 'ratio', value: string | number) => {
    setAssignees(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  const saveAssignees = () => {
    updateTask(task!.id, { assignees })
  }

  const totalRatio = assignees.reduce((sum, a) => sum + (a.ratio || 0), 0)

  return (
    <aside className="w-80 flex-shrink-0 bg-[#181825] border-l border-[#313244] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#313244]">
        <span className="text-xs text-[#6c7086]">任务详情</span>
        <div className="flex items-center gap-2">
          {isOverdue && (
            <span className="text-xs text-[#f38ba8]">已逾期</span>
          )}
          <button onClick={() => selectTask(null)} className="text-[#6c7086] hover:text-[#cdd6f4]">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="w-full bg-transparent text-[#cdd6f4] text-sm font-medium outline-none border-b border-transparent focus:border-[#45475a] pb-1"
        />

        {/* Status */}
        <div>
          <label className="text-xs text-[#6c7086] mb-1 block">状态</label>
          <div className="flex gap-1 flex-wrap">
            {statuses.map(s => (
              <button
                key={s.value}
                onClick={() => updateTask(task!.id, { status: s.value })}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  task!.status === s.value
                    ? 'text-white'
                    : 'bg-[#313244] text-[#a6adc8] hover:bg-[#45475a]'
                }`}
                style={task!.status === s.value ? { backgroundColor: s.color } : {}}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1">
            <Flag size={11} /> 优先级
          </label>
          <div className="flex gap-1 flex-wrap">
            {priorities.map(p => (
              <button
                key={p.value}
                onClick={() => updateTask(task!.id, { priority: p.value })}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  task!.priority === p.value
                    ? 'text-white'
                    : 'bg-[#313244] text-[#a6adc8] hover:bg-[#45475a]'
                }`}
                style={task!.priority === p.value ? { backgroundColor: p.color } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Created time + Deadline */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-[#6c7086] mb-1 block">创建时间</label>
            <input
              type="text"
              value={dayjs(task!.created_at).format('YYYY-MM-DD HH:mm')}
              readOnly
              className="w-full bg-[#313244]/60 text-[#a6adc8] text-xs rounded px-2 py-1.5 cursor-not-allowed"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1">
              <Calendar size={11} /> 完成时间
            </label>
            <input
              type="date"
              value={task!.deadline ? dayjs(task!.deadline).format('YYYY-MM-DD') : ''}
              onChange={(e) => updateTask(task!.id, { deadline: e.target.value || null })}
              className="w-full bg-[#313244] text-[#cdd6f4] text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#89b4fa]"
            />
          </div>
        </div>

        {/* Assignees */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-[#6c7086] flex items-center gap-1">
              <Users size={11} /> 责任人
            </label>
            <button
              onClick={addAssignee}
              className="flex items-center gap-0.5 text-xs text-[#89b4fa] hover:text-[#74c7ec]"
            >
              <Plus size={11} /> 添加
            </button>
          </div>
          {assignees.length > 0 && (
            <div className="space-y-1.5">
              {assignees.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    value={a.name}
                    onChange={e => updateAssignee(i, 'name', e.target.value)}
                    onBlur={saveAssignees}
                    placeholder="姓名"
                    className="flex-1 bg-[#313244] text-[#cdd6f4] text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#89b4fa] placeholder-[#585b70]"
                  />
                  <div className="flex items-center gap-0.5 bg-[#313244] rounded px-1.5 py-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={a.ratio || ''}
                      onChange={e => updateAssignee(i, 'ratio', Number(e.target.value))}
                      onBlur={saveAssignees}
                      className="w-10 bg-transparent text-[#cdd6f4] text-xs text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[10px] text-[#6c7086]">%</span>
                  </div>
                  <button onClick={() => removeAssignee(i)} className="text-[#6c7086] hover:text-[#f38ba8]">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {totalRatio > 0 && totalRatio !== 100 && (
                <p className="text-[10px] text-[#f9e2af]">合计 {totalRatio}%</p>
              )}
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1">
            <Folder size={11} /> 分类
          </label>
          <select
            value={task!.category_id || ''}
            onChange={(e) => updateTask(task!.id, { category_id: e.target.value || null })}
            className="w-full bg-[#313244] text-[#cdd6f4] text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#89b4fa]"
          >
            <option value="">无分类</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1">
            <Tag size={11} /> 标签
          </label>
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleToggleTag(tag.id)}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${
                  task!.tags.some(t => t.id === tag.id)
                    ? 'ring-1'
                    : 'opacity-50 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: tag.color + '20',
                  color: tag.color,
                  ringColor: tag.color,
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-[#6c7086] mb-1 block">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescBlur}
            rows={4}
            className="w-full bg-[#313244] text-[#cdd6f4] text-sm rounded px-2 py-1.5 outline-none resize-none focus:ring-1 focus:ring-[#89b4fa]"
            placeholder="添加描述..."
          />
        </div>
      </div>

      {/* Footer — buttons side by side */}
      <div className="px-4 py-3 border-t border-[#313244]">
        <div className="flex gap-2">
          {task!.status !== 'cancelled' && task!.status !== 'done' && (
            <button
              onClick={handleCancel}
              className="flex-1 py-1.5 rounded text-sm text-[#f9e2af] hover:bg-[#f9e2af]/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <Ban size={14} /> 取消任务
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex-1 py-1.5 rounded text-sm text-[#f38ba8] hover:bg-[#f38ba8]/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} /> 删除任务
          </button>
        </div>
      </div>
    </aside>
  )
}
