import { useEffect } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { ChevronLeft, ChevronRight, Plus, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react'
import dayjs from 'dayjs'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const priorityLabels: Record<string, string> = {
  low: '低', medium: '中', high: '高', urgent: '紧急',
}
const priorityColors: Record<string, string> = {
  low: '#a6e3a1', medium: '#f9e2af', high: '#fab387', urgent: '#f38ba8',
}
const statusLabels: Record<string, string> = {
  todo: '待办', in_progress: '进行中', done: '已完成',
}
const statusBorderColors: Record<string, string> = {
  todo: '#89b4fa', in_progress: '#fab387', done: '#a6e3a1',
}

export default function WeeklyReport() {
  const { reportData, weekAnchor, navigateWeek, loadWeeklyReport } = useTaskStore()

  useEffect(() => {
    loadWeeklyReport()
  }, [])

  if (!reportData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e2e] text-[#6c7086]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#89b4fa] border-t-transparent rounded-full mx-auto mb-3" />
          加载中...
        </div>
      </div>
    )
  }

  const { summary, dailyStats, categoryStats, priorityStats, createdTasks, completedTasks, inProgressTasks, weekStart, weekEnd } = reportData
  const weekLabel = `${weekStart} ~ ${weekEnd}`
  const isCurrentWeek = dayjs().startOf('isoWeek').format('YYYY-MM-DD') === dayjs(weekStart).format('YYYY-MM-DD')

  // Daily chart data: format x-axis
  const dayNames = ['一', '二', '三', '四', '五', '六', '日']
  const dailyData = dailyStats.map((d, i) => ({
    name: dayNames[i],
    fullDate: d.date,
    新建: d.created,
    完成: d.completed,
    进行中: d.inProgress,
  }))

  return (
    <div className="flex-1 overflow-y-auto bg-[#1e1e2e]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1e1e2e]/95 backdrop-blur border-b border-[#313244] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-[#94e2d5]" />
          <h1 className="text-lg font-semibold text-[#cdd6f4]">周报</h1>
          {isCurrentWeek && (
            <span className="text-xs bg-[#a6e3a1]/20 text-[#a6e3a1] px-2 py-0.5 rounded-full">本周</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-1.5 rounded-lg text-[#6c7086] hover:bg-[#313244] hover:text-[#cdd6f4] transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-[#a6adc8] min-w-[200px] text-center">{weekLabel}</span>
          <button
            onClick={() => navigateWeek('next')}
            className="p-1.5 rounded-lg text-[#6c7086] hover:bg-[#313244] hover:text-[#cdd6f4] transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard
            icon={<Plus size={18} />}
            label="本周新建"
            value={summary.created}
            color="#89b4fa"
          />
          <SummaryCard
            icon={<CheckCircle size={18} />}
            label="本周完成"
            value={summary.completed}
            color="#a6e3a1"
          />
          <SummaryCard
            icon={<Clock size={18} />}
            label="进行中"
            value={summary.inProgress}
            color="#fab387"
          />
          <SummaryCard
            icon={<AlertTriangle size={18} />}
            label="逾期"
            value={summary.overdue}
            color="#f38ba8"
          />
        </div>

        {/* Daily Trend Chart */}
        <Section title="每日任务趋势">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#313244" />
                <XAxis dataKey="name" tick={{ fill: '#6c7086', fontSize: 12 }} axisLine={{ stroke: '#313244' }} />
                <YAxis tick={{ fill: '#6c7086', fontSize: 12 }} axisLine={{ stroke: '#313244' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181825', border: '1px solid #313244', borderRadius: 8, color: '#cdd6f4' }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
                />
                <Bar dataKey="新建" fill="#89b4fa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="完成" fill="#a6e3a1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="进行中" fill="#fab387" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Category & Priority Charts */}
        <div className="grid grid-cols-2 gap-4">
          <Section title="分类任务分布">
            <div className="h-56">
              {categoryStats.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[#6c7086] text-sm">暂无分类数据</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#313244" />
                    <XAxis type="number" tick={{ fill: '#6c7086', fontSize: 11 }} axisLine={{ stroke: '#313244' }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#6c7086', fontSize: 11 }} axisLine={{ stroke: '#313244' }} width={60} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#181825', border: '1px solid #313244', borderRadius: 8, color: '#cdd6f4' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="total" name="总任务" fill="#89b4fa" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="done" name="已完成" fill="#a6e3a1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Section>

          <Section title="优先级分布">
            <div className="h-56">
              {priorityStats.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[#6c7086] text-sm">暂无数据</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityStats}
                      dataKey="count"
                      nameKey="priority"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ payload }: any) => `${priorityLabels[payload.priority] || payload.priority} ${payload.count}`}
                      labelLine={{ stroke: '#6c7086' }}
                    >
                      {priorityStats.map((entry) => (
                        <Cell key={entry.priority} fill={priorityColors[entry.priority] || '#6c7086'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#181825', border: '1px solid #313244', borderRadius: 8, color: '#cdd6f4' }}
                      formatter={(value: any, name: any) => [value, priorityLabels[name] || name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Section>
        </div>

        {/* Completed Tasks */}
        <Section title={`本周完成任务 (${completedTasks.length})`}>
          {completedTasks.length === 0 ? (
            <EmptyHint icon={<CheckCircle size={20} />} text="本周暂无完成任务" />
          ) : (
            <div className="space-y-1">
              {completedTasks.map((task) => (
                <TaskRow key={task.id} task={task} showCompletion />
              ))}
            </div>
          )}
        </Section>

        {/* In-Progress Tasks */}
        <Section title={`本周进行中任务 (${inProgressTasks.length})`}>
          {inProgressTasks.length === 0 ? (
            <EmptyHint icon={<Clock size={20} />} text="暂无进行中任务" />
          ) : (
            <div className="space-y-1">
              {inProgressTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </Section>

        {/* Created Tasks */}
        <Section title={`本周新建任务 (${createdTasks.length})`}>
          {createdTasks.length === 0 ? (
            <EmptyHint icon={<Plus size={20} />} text="本周暂无新建任务" />
          ) : (
            <div className="space-y-1">
              {createdTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

/* -------- Sub-components -------- */

function SummaryCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number; color: string;
}) {
  return (
    <div className="bg-[#181825] border border-[#313244] rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-[#cdd6f4]">{value}</div>
        <div className="text-xs text-[#6c7086]">{label}</div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#181825] border border-[#313244] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[#a6adc8] mb-4">{title}</h3>
      {children}
    </div>
  )
}

function EmptyHint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-[#6c7086]">
      <span className="mb-2 opacity-50">{icon}</span>
      <span className="text-sm">{text}</span>
    </div>
  )
}

function TaskRow({ task, showCompletion }: { task: any; showCompletion?: boolean }) {
  const statusColor = statusBorderColors[task.status] || '#6c7086'
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#313244]/40 transition-colors group">
      {/* Status indicator */}
      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor }} />
      
      {/* Title */}
      <span className={`flex-1 text-sm truncate ${task.status === 'done' ? 'text-[#6c7086]' : 'text-[#cdd6f4]'}`}>
        {task.title}
      </span>

      {/* Priority badge */}
      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
        style={{
          backgroundColor: `${priorityColors[task.priority]}18`,
          color: priorityColors[task.priority],
        }}
      >
        {priorityLabels[task.priority]}
      </span>

      {/* Category */}
      {task.category_name && (
        <span className="text-xs text-[#6c7086] flex-shrink-0">{task.category_name}</span>
      )}

      {/* Status */}
      <span className="text-xs text-[#6c7086] flex-shrink-0">{statusLabels[task.status]}</span>

      {/* Completion info */}
      {showCompletion && task.deadline && (
        <span className="text-xs text-[#a6adc8] flex-shrink-0">
          {dayjs(task.completed_at).isBefore(dayjs(task.deadline))
            ? `提前${dayjs(task.deadline).diff(dayjs(task.completed_at), 'day')}天`
            : dayjs(task.completed_at).isAfter(dayjs(task.deadline), 'day')
              ? `逾期${dayjs(task.completed_at).diff(dayjs(task.deadline), 'day')}天`
              : '准时'}
        </span>
      )}
    </div>
  )
}
