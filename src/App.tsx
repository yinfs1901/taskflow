import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TaskList from './components/TaskList'
import TaskDetail from './components/TaskDetail'
import { useTaskStore } from './stores/taskStore'

export default function App() {
  const { loadTasks, loadCategories, loadTags } = useTaskStore()

  useEffect(() => {
    loadCategories()
    loadTags()
    loadTasks()
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <div className="titlebar" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <TaskList />
        <TaskDetail />
      </div>
    </div>
  )
}
