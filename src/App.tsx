import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TaskList from './components/TaskList'
import TaskDetail from './components/TaskDetail'
import CalendarView from './components/CalendarView'
import WeeklyReport from './components/WeeklyReport'
import { useTaskStore } from './stores/taskStore'

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
      <div className="titlebar" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {activeFilter === 'calendar' ? (
          <CalendarView />
        ) : activeFilter === 'weekly_report' ? (
          <WeeklyReport />
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
