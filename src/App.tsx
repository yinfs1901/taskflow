import { useEffect, Suspense, lazy, Component } from 'react'
import Sidebar from './components/Sidebar'
import TaskList from './components/TaskList'
import TaskDetail from './components/TaskDetail'
import { useTaskStore } from './stores/taskStore'

const CalendarView = lazy(() => import('./components/CalendarView'))
const WeeklyReport = lazy(() => import('./components/WeeklyReport'))

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center bg-[#1e1e2e]">
          <div className="text-center">
            <div className="text-[#f38ba8] text-sm mb-2">加载失败</div>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-xs text-[#89b4fa] hover:text-[#b4befe] underline"
            >
              重试
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center bg-[#1e1e2e]">
    <div className="text-[#6c7086] text-sm">加载中...</div>
  </div>
)

export default function App() {
  const { loadTasks, loadCategories, loadTags, activeFilter, loadWeeklyReport } = useTaskStore()

  useEffect(() => {
    loadCategories()
    loadTags()
    loadTasks()
  }, [])

  useEffect(() => {
    if (activeFilter === 'weekly_report') {
      loadWeeklyReport()
    }
  }, [activeFilter])

  return (
    <div className="flex flex-col h-screen">
      <div className="titlebar flex items-center px-4">
        <span className="text-sm text-[#6c7086] font-medium select-none">TaskFlow</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {activeFilter === 'calendar' ? (
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <CalendarView />
            </Suspense>
          </ErrorBoundary>
        ) : activeFilter === 'weekly_report' ? (
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <WeeklyReport />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <>
            <TaskList />
            <TaskDetail />
          </>
        )}
      </div>
    </div>
  )
}
