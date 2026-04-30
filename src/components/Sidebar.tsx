import { useTaskStore } from '../stores/taskStore'
import { Inbox, Calendar, Star, CheckCircle, Folder, Plus, X, Search, Library, User } from 'lucide-react'
import { useState } from 'react'

const filterItems = [
  { key: 'task_library' as const, label: '任务库', icon: Library, color: '#89dceb' },
  { key: 'my_tasks' as const, label: '我的任务', icon: User, color: '#cba6f7' },
  { key: 'today' as const, label: '今天到期', icon: Calendar, color: '#a6e3a1' },
  { key: 'important' as const, label: '重要', icon: Star, color: '#fab387' },
  { key: 'done' as const, label: '已完成', icon: CheckCircle, color: '#6c7086' },
]

export default function Sidebar() {
  const { activeFilter, activeCategoryId, categories, setFilter, setCategory, createCategory, deleteCategory, searchQuery, setSearch } = useTaskStore()
  const [newCatName, setNewCatName] = useState('')
  const [showCatInput, setShowCatInput] = useState(false)

  const handleAddCategory = () => {
    if (!newCatName.trim()) return
    const colors = ['#f38ba8', '#fab387', '#f9e2af', '#a6e3a1', '#89b4fa', '#cba6f7', '#f5c2e7']
    const color = colors[categories.length % colors.length]
    createCategory(newCatName.trim(), color)
    setNewCatName('')
    setShowCatInput(false)
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-[#181825] border-r border-[#313244] flex flex-col">
      {/* Search */}
      <div className="p-3">
        <div className="flex items-center gap-2 bg-[#313244] rounded-lg px-3 py-1.5">
          <Search size={14} className="text-[#6c7086]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索任务..."
            className="bg-transparent text-sm text-[#cdd6f4] placeholder-[#6c7086] outline-none flex-1"
          />
        </div>
      </div>

      {/* Filters */}
      <nav className="px-2">
        {filterItems.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeFilter === key && !activeCategoryId
                ? 'bg-[#313244] text-[#cdd6f4]'
                : 'text-[#a6adc8] hover:bg-[#313244]/50 hover:text-[#cdd6f4]'
            }`}
          >
            <Icon size={16} style={{ color }} />
            {label}
          </button>
        ))}
      </nav>

      {/* Categories */}
      <div className="mt-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">分类</span>
          <button onClick={() => setShowCatInput(true)} className="text-[#6c7086] hover:text-[#cdd6f4]">
            <Plus size={14} />
          </button>
        </div>

        {showCatInput && (
          <div className="px-3 pb-2 flex items-center gap-1">
            <input
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              placeholder="分类名称"
              className="flex-1 bg-[#313244] rounded px-2 py-1 text-sm text-[#cdd6f4] placeholder-[#6c7086] outline-none"
            />
            <button onClick={handleAddCategory} className="text-[#a6e3a1] hover:text-[#89b4fa]">
              <Plus size={14} />
            </button>
            <button onClick={() => { setShowCatInput(false); setNewCatName('') }} className="text-[#6c7086] hover:text-[#f38ba8]">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="px-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                activeFilter === 'category' && activeCategoryId === cat.id
                  ? 'bg-[#313244] text-[#cdd6f4]'
                  : 'text-[#a6adc8] hover:bg-[#313244]/50 hover:text-[#cdd6f4]'
              }`}
              onClick={() => setCategory(cat.id)}
            >
              <Folder size={16} style={{ color: cat.color }} />
              <span className="flex-1 truncate">{cat.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id) }}
                className="hidden group-hover:block text-[#6c7086] hover:text-[#f38ba8]"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
