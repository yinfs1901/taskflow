import { useTaskStore } from '../stores/taskStore'
import { X, Flag, Calendar, Tag, Folder, UserPlus, CheckCircle, Trash2, Save, ArrowRight, RotateCcw } from 'lucide-react'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import type { TaskPriority, TaskStatus } from '../types'
import { PRIORITY_OPTIONS, STATUS_OPTIONS, PRIORITY_MAP, STATUS_MAP } from '../constants'

export default function TaskDetail() {
  const { selectedTaskId, selectedTask, categories, tags, updateTask, deleteTask, selectTask } = useTaskStore()
  const task = selectedTask

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
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
    && task.status !== 'done'

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

  const handleReject = () => {
    updateTask(task!.id, { status: 'todo', owner_id: null, accepted_at: null })
  }

  const handleContinue = () => {
    updateTask(task!.id, { status: 'in_progress', completed_at: null })
  }

  const handleComplete = () => {
    updateTask(task!.id, { status: 'done', completed_at: new Date().toISOString() })
  }

  const handleClaim = () => {
    const now = new Date().toISOString()
    updateTask(task!.id, {
      status: 'in_progress',
      owner_id: 'current-user',
      accepted_at: now
    })
  }

  const handleToggleTag = (tagId: string) => {
    const currentTagIds = task!.tags.map(t => t.id)
    const newTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter(id => id !== tagId)
      : [...currentTagIds, tagId]
    updateTask(task!.id, { tag_ids: newTagIds })
  }

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
            {STATUS_OPTIONS.map(s => (
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
            {PRIORITY_OPTIONS.map(p => (
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

        {/* Created time + Accepted time + Completed time + Deadline */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#6c7086] mb-1 block">创建时间</label>
            <input
              type="text"
              value={dayjs(task!.created_at).format('YYYY-MM-DD HH:mm')}
              readOnly
              className="w-full bg-[#313244]/60 text-[#a6adc8] text-xs rounded px-2 py-1.5 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1">
              <UserPlus size={11} /> 接受时间
            </label>
            <input
              type="text"
              value={task!.accepted_at ? dayjs(task!.accepted_at).format('YYYY-MM-DD HH:mm') : '未领用'}
              readOnly
              className={`w-full text-xs rounded px-2 py-1.5 cursor-not-allowed ${task!.accepted_at ? 'bg-[#313244]/60 text-[#a6adc8]' : 'bg-[#313244]/30 text-[#585b70]'}`}
            />
          </div>
          <div>
            <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1">
              <CheckCircle size={11} /> 实际完成时间
            </label>
            <input
              type="text"
              value={task!.completed_at ? dayjs(task!.completed_at).format('YYYY-MM-DD HH:mm') : '-'}
              readOnly
              className="w-full bg-[#313244]/60 text-[#a6adc8] text-xs rounded px-2 py-1.5 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1">
              <Calendar size={11} /> 计划完成时间
            </label>
            <input
              type="date"
              value={task!.deadline ? dayjs(task!.deadline).format('YYYY-MM-DD') : ''}
              onChange={(e) => updateTask(task!.id, { deadline: e.target.value || null })}
              className="w-full bg-[#313244] text-[#cdd6f4] text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#89b4fa]"
            />
          </div>
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
            {tags.map(tag => {
              const isSelected = task!.tags.some(t => t.id === tag.id)
              return (
              <button
                key={tag.id}
                onClick={() => handleToggleTag(tag.id)}
                className={`text-xs px-2 py-0.5 rounded ring-1 ring-transparent transition-all ${
                  isSelected
                    ? 'opacity-100'
                    : 'opacity-50 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: tag.color + '20',
                  color: tag.color,
                  '--tw-ring-color': isSelected ? tag.color : 'transparent',
                } as React.CSSProperties}
              >
                {tag.name}
              </button>
            )})}
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

      {/* Footer — buttons by status */}
      <div className="px-4 py-3 border-t border-[#313244]">
        {task!.status === 'todo' && (
          <div className="flex gap-2">
            <button
              onClick={handleClaim}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#74c7ec] transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowRight size={14} /> 领用
            </button>
            <button
              onClick={() => {
                handleTitleBlur()
                handleDescBlur()
              }}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#313244] text-[#cdd6f4] hover:bg-[#45475a] transition-colors flex items-center justify-center gap-1.5"
            >
              <Save size={14} /> 更新
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#f38ba8]/15 text-[#f38ba8] hover:bg-[#f38ba8]/25 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} /> 删除
            </button>
          </div>
        )}
        {task!.status === 'in_progress' && (
          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#94e2d5] transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle size={14} /> 完成
            </button>
            <button
              onClick={() => {
                handleTitleBlur()
                handleDescBlur()
              }}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#74c7ec] transition-colors flex items-center justify-center gap-1.5"
            >
              <Save size={14} /> 更新
            </button>
            <button
              onClick={handleReject}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#45475a] text-[#a6adc8] hover:bg-[#585b70] transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} /> 驳回
            </button>
          </div>
        )}
        {task!.status === 'done' && (
          <div className="flex gap-2">
            <button
              onClick={handleContinue}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#fab387] text-[#1e1e2e] hover:bg-[#f9e2af] transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} /> 继续执行
            </button>
            <button
              onClick={() => {
                handleTitleBlur()
                handleDescBlur()
              }}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#313244] text-[#cdd6f4] hover:bg-[#45475a] transition-colors flex items-center justify-center gap-1.5"
            >
              <Save size={14} /> 更新
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#f38ba8]/15 text-[#f38ba8] hover:bg-[#f38ba8]/25 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} /> 删除
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
