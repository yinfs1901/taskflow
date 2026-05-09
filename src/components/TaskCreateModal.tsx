import { useState } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { X } from 'lucide-react'
import type { TaskPriority, TaskStatus } from '../types'
import dayjs from 'dayjs'

const priorities: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: '低', color: '#a6e3a1' },
  { value: 'medium', label: '中', color: '#f9e2af' },
  { value: 'high', label: '高', color: '#fab387' },
  { value: 'urgent', label: '紧急', color: '#f38ba8' },
]

const statuses: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: '待办', color: '#6c7086' },
  { value: 'in_progress', label: '进行中', color: '#89b4fa' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function TaskCreateModal({ open, onClose }: Props) {
  const { categories, tags, createTask } = useTaskStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [deadline, setDeadline] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  if (!open) return null

  const handleSubmit = async () => {
    if (!title.trim()) return
    await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      deadline: deadline || null,
      category_id: categoryId || null,
      tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    })
    handleClose()
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setStatus('todo')
    setDeadline('')
    setCategoryId('')
    setSelectedTagIds([])
    onClose()
  }

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-[#1e1e2e] border border-[#313244] rounded-xl shadow-2xl w-[520px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#313244]">
          <h3 className="text-base font-semibold text-[#cdd6f4]">新建任务</h3>
          <button onClick={handleClose} className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs text-[#6c7086] mb-1 block">标题 <span className="text-[#f38ba8]">*</span></label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && title.trim()) handleSubmit() }}
              placeholder="输入任务标题..."
              className="w-full bg-[#313244] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#89b4fa] placeholder-[#585b70]"
            />
          </div>

          {/* Status + Priority row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-[#6c7086] mb-1 block">状态</label>
              <div className="flex gap-1">
                {statuses.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      status === s.value ? 'text-white' : 'bg-[#313244] text-[#a6adc8] hover:bg-[#45475a]'
                    }`}
                    style={status === s.value ? { backgroundColor: s.color } : {}}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-[#6c7086] mb-1 block">优先级</label>
              <div className="flex gap-1">
                {priorities.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      priority === p.value ? 'text-white' : 'bg-[#313244] text-[#a6adc8] hover:bg-[#45475a]'
                    }`}
                    style={priority === p.value ? { backgroundColor: p.color } : {}}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Created time + Deadline row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-[#6c7086] mb-1 block">创建时间</label>
              <input
                type="text"
                value={dayjs().format('YYYY-MM-DD HH:mm')}
                readOnly
                className="w-full bg-[#313244]/60 text-[#a6adc8] text-sm rounded-lg px-3 py-2 cursor-not-allowed"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-[#6c7086] mb-1 block">计划完成时间</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-[#313244] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#89b4fa]"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-[#6c7086] mb-1 block">分类</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full bg-[#313244] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#89b4fa]"
            >
              <option value="">无分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="text-xs text-[#6c7086] mb-1 block">标签</label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? 'ring-1 ring-offset-1 ring-offset-[#1e1e2e]'
                        : 'opacity-50 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: tag.color + '20',
                      color: tag.color,
                      ringColor: selectedTagIds.includes(tag.id) ? tag.color : undefined,
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-xs text-[#6c7086] mb-1 block">描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="添加任务描述..."
              className="w-full bg-[#313244] text-[#cdd6f4] text-sm rounded-lg px-3 py-2 outline-none resize-none focus:ring-1 focus:ring-[#89b4fa] placeholder-[#585b70]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#313244]">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg text-sm text-[#a6adc8] hover:bg-[#313244] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-5 py-1.5 rounded-lg text-sm font-medium bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#74c7ec] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}
