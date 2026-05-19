import { useTaskStore } from '../stores/taskStore'
import { X, Flag, Calendar, Tag, Folder, FolderOpen, UserPlus, CheckCircle, Trash2, Save, ArrowRight, RotateCcw, Plus, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import type { TaskPriority, TaskStatus, Task } from '../types'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants'
import TaskCreateModal from './TaskCreateModal'

// --- SubtaskItem 子组件 ---
function SubtaskItem({ task, onStatusChange, onDelete }: {
  task: Task
  onStatusChange: (status: string) => void
  onDelete: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const isDone = task.status === 'done'

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#313244]/50 group hover:bg-[#313244] transition-colors">
      {/* 状态圆点 */}
      <button onClick={() => onStatusChange(task.status === 'todo' ? 'in_progress' : 'done')} className="flex-shrink-0 mt-px">
        <span className={`w-3 h-3 rounded-full border-2 ${
          isDone
            ? 'bg-[#a6e3a1] border-[#a6e3a1]'
            : 'bg-transparent border-[#585b70] hover:border-[#89b4fa]'
        }`}>
          {isDone && (
            <svg width="6" height="6" viewBox="0 0 8 8" className="block mx-auto -mt-1.5"><path d="M1 4l2 2 3-4" stroke="#1e1e2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          )}
        </span>
      </button>

      {/* 标题 */}
      <span className={`flex-1 text-xs truncate ${
        isDone ? 'text-[#585b70] line-through' : 'text-[#cdd6f4]'
      }`}>
        {task.title}
      </span>

      {/* 状态标签 + 下拉菜单 */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex-shrink-0 flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] transition-colors"
          style={{
            backgroundColor: task.status === 'done' ? '#a6e3a120' : task.status === 'in_progress' ? '#89b4fa20' : '#45475a',
            color: task.status === 'done' ? '#a6e3a1' : task.status === 'in_progress' ? '#89b4fa' : '#a6adc8',
          }}
        >
          {task.status === 'done' ? '已完成' : task.status === 'in_progress' ? '进行中' : '待办'}
          <ChevronDown size={10} />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 z-50 bg-[#1e1e2e] border border-[#313244] rounded-lg shadow-xl overflow-hidden min-w-[80px]">
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange('todo'); setShowMenu(false) }}
              className={`w-full text-left px-2.5 py-1.5 text-[10px] transition-colors ${task.status === 'todo' ? 'text-[#cdd6f4] bg-[#45475a]' : 'text-[#a6adc8] hover:bg-[#313244]'}`}
            >
              待办
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange('in_progress'); setShowMenu(false) }}
              className={`w-full text-left px-2.5 py-1.5 text-[10px] transition-colors ${task.status === 'in_progress' ? 'text-[#89b4fa] bg-[#89b4fa]/10' : 'text-[#a6adc8] hover:bg-[#313244]'}`}
            >
              进行中
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange('done'); setShowMenu(false) }}
              className={`w-full text-left px-2.5 py-1.5 text-[10px] transition-colors ${task.status === 'done' ? 'text-[#a6e3a1] bg-[#a6e3a1]/10' : 'text-[#a6adc8] hover:bg-[#313244]'}`}
            >
              已完成
            </button>
          </div>
        )}
      </div>

      {/* 删除按钮 */}
      <button
        onClick={onDelete}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-[#585b70] hover:text-[#f38ba8] transition-all p-0.5"
      >
        <X size={12} />
      </button>
    </div>
  )
}

export default function TaskDetail() {
  const { selectedTaskId, selectedTask, categories, tags, updateTask, deleteTask, selectTask,
    childrenTasks, loadChildren } = useTaskStore()
  const task = selectedTask

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showChildModal, setShowChildModal] = useState(false)
  const [newChildTitle, setNewChildTitle] = useState('')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      loadChildren(task.id)
    }
  }, [task?.id, loadChildren])

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

  const handleToggleChild = (childId: string, currentStatus: string, newStatus?: string) => {
    const targetStatus = newStatus ?? (currentStatus === 'done' ? 'todo' : 'done')
    const updates: Record<string, any> = { status: targetStatus }
    if (targetStatus === 'done') {
      updates.completed_at = new Date().toISOString()
    } else {
      updates.completed_at = null
    }
    updateTask(childId, updates).then(() => loadChildren(task!.id))
  }

  const handleQuickAddChild = () => {
    const t = newChildTitle.trim()
    if (!t || !task) return
    updateTask(task.id, { /* dummy to trigger refresh via store */ })
    // Use createTask from store with parent_id
    const { createTask } = useTaskStore.getState()
    createTask({ title: t, status: 'todo', parent_id: task.id }).then(() => {
      setNewChildTitle('')
      loadChildren(task.id)
    })
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
        {/* Children / Subtasks */}
        <div>
          {/* Section header with icon */}
          <div className="flex items-center gap-1.5 mb-3">
            <FolderOpen size={13} className="text-[#89b4fa]" />
            <span className="text-xs text-[#cdd6f4] font-medium">子任务</span>
          </div>

          {childrenTasks.length > 0 ? (
            <>
              {/* Progress bar */}
              {(() => {
                const done = childrenTasks.filter(c => c.status === 'done').length
                const total = childrenTasks.length
                const pct = Math.round(done / total * 100)
                return (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-[#6c7086]">完成进度</span>
                      <span className="text-[10px] font-medium text-[#89b4fa]">{done}/{total} {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#313244] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#89b4fa] to-[#74c7ec] rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })()}

              {/* Subtask list */}
              <div className="space-y-1.5">
                {childrenTasks.map(child => (
                  <SubtaskItem
                    key={child.id}
                    task={child}
                    onStatusChange={(status) => handleToggleChild(child.id, child.status, status)}
                    onDelete={() => {
                      updateTask(child.id, { parent_id: null }).then(() => loadChildren(task!.id))
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-[#585b70] py-2">暂无子任务</p>
          )}

          {/* Add subtask input row — hidden when parent is done */}
          {task!.status !== 'done' && (
          <div className="flex gap-2 mt-3">
            <input
              value={newChildTitle}
              onChange={(e) => setNewChildTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuickAddChild()
              }}
              placeholder="添加子任务..."
              className="flex-1 bg-[#313244]/60 text-[#cdd6f4] text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#89b4fa] placeholder:text-[#585b70] border border-transparent focus:border-[#45475a]"
            />
            <button
              onClick={handleQuickAddChild}
              disabled={!newChildTitle.trim()}
              className="px-3 py-2 rounded-lg bg-[#89b4fa] disabled:opacity-30 text-[#1e1e2e] hover:bg-[#74c7ec] transition-colors text-xs font-medium flex items-center gap-1 whitespace-nowrap"
            >
              <Plus size={14} /> 添加
            </button>
          </div>
          )}
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
      {/* Subtask create modal */}
      <TaskCreateModal
        open={showChildModal}
        onClose={() => setShowChildModal(false)}
        presetParentId={task!.id}
        presetParentTitle={task!.title}
        onCreated={() => loadChildren(task!.id)}
      />
    </aside>
  )
}
