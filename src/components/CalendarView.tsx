import { useEffect, useMemo, useState, useRef } from 'react'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight, Calendar, X, Flag, Tag as TagIcon, Folder, CheckCircle, ArrowRight, Save, Trash2, RotateCcw, UserPlus } from 'lucide-react'
import { useTaskStore } from '../stores/taskStore'
import type { Task, TaskPriority, TaskStatus, Category, Tag, TaskUpdateInput } from '../types'
import { PRIORITY_OPTIONS, STATUS_OPTIONS, CALENDAR_STATUS_COLORS } from '../constants'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

export default function CalendarView() {
  const { calendarDate, calendarViewMode, calendarTasks, loadCalendar, setCalendarView, navigateCalendar, categories, tags, updateTask, deleteTask } = useTaskStore()

  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [popupDate, setPopupDate] = useState<string | null>(null)
  const [popupAnchor, setPopupAnchor] = useState<{ x: number; y: number } | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadCalendar()
  }, [])

  // Close popup on outside click
  useEffect(() => {
    if (!popupDate) return
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupDate(null)
        setPopupAnchor(null)
      }
    }
    setTimeout(() => document.addEventListener('click', handler), 0)
    return () => document.removeEventListener('click', handler)
  }, [popupDate])

  const d = dayjs(calendarDate)
  const title = calendarViewMode === 'year'
    ? `${d.year()}年`
    : calendarViewMode === 'month'
      ? `${d.year()}年 ${d.month() + 1}月`
      : (() => {
          const ws = d.day(1)
          const we = ws.add(6, 'day')
          if (ws.month() === we.month()) {
            return `${ws.year()}年 ${ws.month() + 1}月 ${ws.date()}日 - ${we.date()}日`
          }
          return `${ws.format('M月D日')} - ${we.format('M月D日')}`
        })()

  // Group tasks by date string (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const t of calendarTasks) {
      const dateKey = (t as any).calendar_date?.slice(0, 10)
      if (!dateKey) continue
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(t)
    }
    return map
  }, [calendarTasks])

  const todayStr = dayjs().format('YYYY-MM-DD')

  const openDetail = (task: Task) => setDetailTask(task)
  const closeDetail = () => setDetailTask(null)
  const openPopup = (dateKey: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPopupAnchor({ x: rect.left, y: rect.bottom + 4 })
    setPopupDate(dateKey)
  }

  return (
    <main className="flex-1 flex flex-col bg-[#1e1e2e] min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#313244]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateCalendar('prev')} className="p-1 rounded hover:bg-[#313244] text-[#a6adc8]">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-[#cdd6f4] min-w-[140px] text-center">{title}</h2>
          <button onClick={() => navigateCalendar('next')} className="p-1 rounded hover:bg-[#313244] text-[#a6adc8]">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-1 bg-[#313244] rounded-lg p-0.5">
          {(['year', 'month', 'week'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setCalendarView(mode)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                calendarViewMode === mode
                  ? 'bg-[#89b4fa] text-[#1e1e2e] font-medium'
                  : 'text-[#a6adc8] hover:text-[#cdd6f4]'
              }`}
            >
              {mode === 'year' ? '年' : mode === 'month' ? '月' : '周'}
            </button>
          ))}
        </div>
      </div>

      {/* View content */}
      <div className="flex-1 overflow-auto p-4">
        {calendarViewMode === 'month' && <MonthView d={d} tasksByDate={tasksByDate} todayStr={todayStr} onOpenDetail={openDetail} onOpenPopup={openPopup} />}
        {calendarViewMode === 'week' && <WeekView d={d} tasksByDate={tasksByDate} todayStr={todayStr} onOpenDetail={openDetail} />}
        {calendarViewMode === 'year' && <YearView d={d} tasksByDate={tasksByDate} todayStr={todayStr} />}
      </div>

      {/* Task Detail Modal */}
      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          categories={categories}
          tags={tags}
          onClose={closeDetail}
          onUpdate={(id, updates) => { updateTask(id, updates); loadCalendar() }}
          onDelete={(id) => { deleteTask(id); closeDetail(); loadCalendar() }}
        />
      )}

      {/* Date Tasks Popup */}
      {popupDate && popupAnchor && (
        <div
          ref={popupRef}
          className="fixed z-50 bg-[#181825] border border-[#45475a] rounded-lg shadow-xl p-3 min-w-[220px] max-w-[300px] max-h-[320px] overflow-auto"
          style={{ left: popupAnchor.x, top: popupAnchor.y }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#a6adc8]">{popupDate}</span>
            <button onClick={() => { setPopupDate(null); setPopupAnchor(null) }} className="text-[#6c7086] hover:text-[#cdd6f4]">
              <X size={12} />
            </button>
          </div>
          <div className="space-y-1">
            {(tasksByDate[popupDate] || []).map(task => (
              <button
                key={task.id}
                onClick={() => { setPopupDate(null); setPopupAnchor(null); openDetail(task) }}
                className="w-full text-left text-xs leading-tight px-2 py-1.5 rounded hover:bg-[#313244] transition-colors"
                style={{
                  borderLeft: `3px solid ${CALENDAR_STATUS_COLORS[task.status] || '#6c7086'}`,
                  color: CALENDAR_STATUS_COLORS[task.status] || '#6c7086',
                }}
              >
                <div className="text-[#cdd6f4] truncate">{task.title}</div>
                <div className="text-[10px] opacity-70">
                  {task.status === 'todo' ? '待办' : task.status === 'in_progress' ? '进行中' : '已完成'}
                  {task.priority !== 'medium' && ` · ${task.priority}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

// ─── Month View ──────────────────────────────────
function MonthView({ d, tasksByDate, todayStr, onOpenDetail, onOpenPopup }: {
  d: dayjs.Dayjs
  tasksByDate: Record<string, Task[]>
  todayStr: string
  onOpenDetail: (t: Task) => void
  onOpenPopup: (dateKey: string, e: React.MouseEvent) => void
}) {
  const startOfMonth = d.startOf('month')
  const endOfMonth = d.endOf('month')
  // Start from Monday of the week containing the 1st
  const startDay = startOfMonth.day(1)  // Monday of that week
  // End at Sunday of the week containing the last day
  const endDay = endOfMonth.day(0)  // Sunday of that week

  const days: dayjs.Dayjs[] = []
  let cur = startDay
  while (cur.isBefore(endDay) || cur.isSame(endDay, 'day')) {
    days.push(cur)
    cur = cur.add(1, 'day')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-xs font-medium text-[#6c7086] py-2">{w}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map(day => {
          const key = day.format('YYYY-MM-DD')
          const tasks = tasksByDate[key] || []
          const isCurrentMonth = day.month() === d.month()
          const isToday = key === todayStr

          return (
            <div
              key={key}
              className={`border border-[#313244] p-1 min-h-[80px] flex flex-col ${
                !isCurrentMonth ? 'opacity-30' : ''
              } ${isToday ? 'bg-[#89b4fa]/10 border-[#89b4fa]/30' : ''}`}
            >
              <span className={`text-xs font-medium mb-0.5 ${isToday ? 'text-[#89b4fa] font-bold' : 'text-[#a6adc8]'}`}>
                {day.date()}
              </span>
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {tasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={(e) => { e.stopPropagation(); onOpenDetail(task) }}
                    className="text-[10px] leading-tight truncate px-1 py-0.5 rounded w-full text-left hover:brightness-110 transition-all"
                    style={{
                      backgroundColor: `${CALENDAR_STATUS_COLORS[task.status] || '#6c7086'}20`,
                      color: CALENDAR_STATUS_COLORS[task.status] || '#6c7086',
                    }}
                  >
                    {task.title}
                  </button>
                ))}
                {tasks.length > 3 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenPopup(key, e) }}
                    className="text-[10px] text-[#89b4fa] hover:text-[#74c7ec] px-1 text-left"
                  >
                    +{tasks.length - 3} 更多
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Week View ──────────────────────────────────
function WeekView({ d, tasksByDate, todayStr, onOpenDetail }: {
  d: dayjs.Dayjs
  tasksByDate: Record<string, Task[]>
  todayStr: string
  onOpenDetail: (t: Task) => void
}) {
  const startOfWeek = d.day(1)  // Monday of the week

  const days: dayjs.Dayjs[] = []
  for (let i = 0; i < 7; i++) {
    days.push(startOfWeek.add(i, 'day'))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => {
          const key = day.format('YYYY-MM-DD')
          const isToday = key === todayStr
          return (
            <div key={key} className={`text-center py-2 rounded ${isToday ? 'bg-[#89b4fa]/15' : ''}`}>
              <div className="text-xs text-[#6c7086]">{WEEKDAYS[day.day() === 0 ? 6 : day.day() - 1]}</div>
              <div className={`text-sm font-semibold ${isToday ? 'text-[#89b4fa]' : 'text-[#cdd6f4]'}`}>
                {day.date()}
              </div>
            </div>
          )
        })}
      </div>
      {/* Day columns */}
      <div className="grid grid-cols-7 flex-1 gap-1">
        {days.map(day => {
          const key = day.format('YYYY-MM-DD')
          const tasks = tasksByDate[key] || []
          return (
            <div key={key} className="space-y-1 overflow-auto">
              {tasks.length === 0 ? (
                <div className="text-[10px] text-[#45475a] text-center py-4">无任务</div>
              ) : (
                tasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => onOpenDetail(task)}
                    className="w-full text-left text-xs leading-snug px-2 py-1.5 rounded hover:brightness-110 transition-all"
                    style={{
                      backgroundColor: `${CALENDAR_STATUS_COLORS[task.status] || '#6c7086'}15`,
                      borderLeft: `3px solid ${CALENDAR_STATUS_COLORS[task.status] || '#6c7086'}`,
                    }}
                  >
                    <div className="text-[#cdd6f4] truncate font-medium">{task.title}</div>
                    <div className="text-[10px]" style={{ color: CALENDAR_STATUS_COLORS[task.status] }}>
                      {task.status === 'todo' ? '待办' : task.status === 'in_progress' ? '进行中' : '已完成'}
                    </div>
                  </button>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Task Detail Modal ──────────────────────────
function TaskDetailModal({ task, categories, tags, onClose, onUpdate, onDelete }: {
  task: Task
  categories: Category[]
  tags: Tag[]
  onClose: () => void
  onUpdate: (id: string, updates: TaskUpdateInput) => void
  onDelete: (id: string) => void
}) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)

  const isOverdue = task.deadline && dayjs(task.deadline).isBefore(dayjs(), 'day') && task.status !== 'done'

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) onUpdate(task.id, { title: title.trim() })
  }
  const handleDescBlur = () => {
    if (description !== task.description) onUpdate(task.id, { description })
  }
  const handleClaim = () => {
    const now = new Date().toISOString()
    onUpdate(task.id, { status: 'in_progress', owner_id: 'current-user', accepted_at: now })
  }
  const handleComplete = () => {
    onUpdate(task.id, { status: 'done', completed_at: new Date().toISOString() })
  }
  const handleReject = () => {
    onUpdate(task.id, { status: 'todo', owner_id: null, accepted_at: null })
  }
  const handleToggleTag = (tagId: string) => {
    const current = task.tags.map(t => t.id)
    const next = current.includes(tagId) ? current.filter(id => id !== tagId) : [...current, tagId]
    onUpdate(task.id, { tag_ids: next })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-[#1e1e2e] border border-[#313244] rounded-xl shadow-2xl w-[420px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#313244]">
          <span className="text-xs text-[#6c7086]">任务详情</span>
          <div className="flex items-center gap-2">
            {isOverdue && <span className="text-xs text-[#f38ba8]">已逾期</span>}
            <button onClick={onClose} className="text-[#6c7086] hover:text-[#cdd6f4]"><X size={14} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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
                  onClick={() => onUpdate(task.id, { status: s.value })}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    task.status === s.value ? 'text-white' : 'bg-[#313244] text-[#a6adc8] hover:bg-[#45475a]'
                  }`}
                  style={task.status === s.value ? { backgroundColor: s.color } : {}}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1"><Flag size={11} /> 优先级</label>
            <div className="flex gap-1 flex-wrap">
              {PRIORITY_OPTIONS.map(p => (
                <button
                  key={p.value}
                  onClick={() => onUpdate(task.id, { priority: p.value })}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    task.priority === p.value ? 'text-white' : 'bg-[#313244] text-[#a6adc8] hover:bg-[#45475a]'
                  }`}
                  style={task.priority === p.value ? { backgroundColor: p.color } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#6c7086] mb-1 block">创建时间</label>
              <input type="text" value={dayjs(task.created_at).format('YYYY-MM-DD HH:mm')} readOnly
                className="w-full bg-[#313244]/60 text-[#a6adc8] text-xs rounded px-2 py-1.5 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1"><UserPlus size={11} /> 接受时间</label>
              <input type="text" value={task.accepted_at ? dayjs(task.accepted_at).format('YYYY-MM-DD HH:mm') : '未领用'} readOnly
                className={`w-full text-xs rounded px-2 py-1.5 cursor-not-allowed ${task.accepted_at ? 'bg-[#313244]/60 text-[#a6adc8]' : 'bg-[#313244]/30 text-[#585b70]'}`} />
            </div>
            <div>
              <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1"><CheckCircle size={11} /> 完成时间</label>
              <input type="text" value={task.completed_at ? dayjs(task.completed_at).format('YYYY-MM-DD HH:mm') : '-'} readOnly
                className="w-full bg-[#313244]/60 text-[#a6adc8] text-xs rounded px-2 py-1.5 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1"><Calendar size={11} /> 截止日期</label>
              <input type="date" value={task.deadline ? dayjs(task.deadline).format('YYYY-MM-DD') : ''}
                onChange={(e) => onUpdate(task.id, { deadline: e.target.value || null })}
                className="w-full bg-[#313244] text-[#cdd6f4] text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#89b4fa]" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1"><Folder size={11} /> 分类</label>
            <select value={task.category_id || ''}
              onChange={(e) => onUpdate(task.id, { category_id: e.target.value || null })}
              className="w-full bg-[#313244] text-[#cdd6f4] text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#89b4fa]">
              <option value="">无分类</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-[#6c7086] mb-1 flex items-center gap-1"><TagIcon size={11} /> 标签</label>
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <button key={tag.id} onClick={() => handleToggleTag(tag.id)}
                  className={`text-xs px-2 py-0.5 rounded transition-colors ${
                    task.tags.some(t => t.id === tag.id) ? 'ring-1' : 'opacity-50 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[#6c7086] mb-1 block">描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleDescBlur}
              rows={4} className="w-full bg-[#313244] text-[#cdd6f4] text-sm rounded px-2 py-1.5 outline-none resize-none focus:ring-1 focus:ring-[#89b4fa]"
              placeholder="添加描述..." />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-5 py-3 border-t border-[#313244]">
          {task.status === 'todo' && (
            <div className="flex gap-2">
              <button onClick={handleClaim}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#74c7ec] transition-colors flex items-center justify-center gap-1.5">
                <ArrowRight size={14} /> 领用
              </button>
              <button onClick={() => { handleTitleBlur(); handleDescBlur() }}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#313244] text-[#cdd6f4] hover:bg-[#45475a] transition-colors flex items-center justify-center gap-1.5">
                <Save size={14} /> 更新
              </button>
              <button onClick={() => onDelete(task.id)}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#f38ba8]/15 text-[#f38ba8] hover:bg-[#f38ba8]/25 transition-colors flex items-center justify-center gap-1.5">
                <Trash2 size={14} /> 删除
              </button>
            </div>
          )}
          {task.status === 'in_progress' && (
            <div className="flex gap-2">
              <button onClick={handleComplete}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#94e2d5] transition-colors flex items-center justify-center gap-1.5">
                <CheckCircle size={14} /> 完成
              </button>
              <button onClick={() => { handleTitleBlur(); handleDescBlur() }}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#74c7ec] transition-colors flex items-center justify-center gap-1.5">
                <Save size={14} /> 更新
              </button>
              <button onClick={handleReject}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#45475a] text-[#a6adc8] hover:bg-[#585b70] transition-colors flex items-center justify-center gap-1.5">
                <RotateCcw size={14} /> 驳回
              </button>
            </div>
          )}
          {task.status === 'done' && (
            <div className="text-center text-xs text-[#6c7086]">任务已完成</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Year View ──────────────────────────────────
function YearView({ d, tasksByDate, todayStr }: { d: dayjs.Dayjs; tasksByDate: Record<string, Task[]>; todayStr: string }) {
  const months: dayjs.Dayjs[] = []
  for (let i = 0; i < 12; i++) {
    months.push(dayjs(`${d.year()}-${String(i + 1).padStart(2, '0')}-01`))
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {months.map(m => {
        const startOfMonth = m.startOf('month')
        const endOfMonth = m.endOf('month')
        const startDay = startOfMonth.day(1)
        const endDay = endOfMonth.day(0)

        // Count tasks per day for this month
        const monthTasks: Record<string, number> = {}
        let totalMonthTasks = 0
        for (const [dateKey, tasks] of Object.entries(tasksByDate)) {
          if (dateKey.startsWith(m.format('YYYY-MM'))) {
            monthTasks[dateKey] = tasks.length
            totalMonthTasks += tasks.length
          }
        }

        // Build mini grid
        const days: dayjs.Dayjs[] = []
        let cur = startDay
        while (cur.isBefore(endDay) || cur.isSame(endDay, 'day')) {
          days.push(cur)
          cur = cur.add(1, 'day')
        }

        return (
          <div key={m.format('YYYY-MM')} className="bg-[#181825] rounded-lg p-3 border border-[#313244]">
            <div className="text-sm font-semibold text-[#cdd6f4] mb-2 text-center">
              {m.month() + 1}月
              {totalMonthTasks > 0 && (
                <span className="ml-1 text-[10px] text-[#6c7086]">({totalMonthTasks})</span>
              )}
            </div>
            {/* Mini headers */}
            <div className="grid grid-cols-7 mb-0.5">
              {WEEKDAYS.map(w => (
                <div key={w} className="text-center text-[9px] text-[#45475a]">{w}</div>
              ))}
            </div>
            {/* Mini day cells */}
            <div className="grid grid-cols-7">
              {days.map(day => {
                const key = day.format('YYYY-MM-DD')
                const count = monthTasks[key] || 0
                const isCurrentMonth = day.month() === m.month()
                const isToday = key === todayStr

                return (
                  <div key={key} className="aspect-square flex flex-col items-center justify-center">
                    <span
                      className={`text-[9px] ${
                        !isCurrentMonth ? 'text-[#45475a]/30' :
                        isToday ? 'text-[#89b4fa] font-bold' : 'text-[#a6adc8]'
                      }`}
                    >
                      {day.date()}
                    </span>
                    {count > 0 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-0.5"
                        style={{ backgroundColor: isCurrentMonth ? '#89b4fa' : '#45475a' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
