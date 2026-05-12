const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // Tasks
  taskList: (filters) => ipcRenderer.invoke('task:list', filters),
  taskCreate: (task) => ipcRenderer.invoke('task:create', task),
  taskUpdate: (id, updates) => ipcRenderer.invoke('task:update', id, updates),
  taskDelete: (id) => ipcRenderer.invoke('task:delete', id),
  taskCalendar: (filters) => ipcRenderer.invoke('task:calendar', filters),
  weeklyReport: (weekStart) => ipcRenderer.invoke('task:weekly-report', weekStart),
  taskCounts: () => ipcRenderer.invoke('task:counts'),

  // Categories
  categoryList: () => ipcRenderer.invoke('category:list'),
  categoryCreate: (cat) => ipcRenderer.invoke('category:create', cat),
  categoryUpdate: (id, updates) => ipcRenderer.invoke('category:update', id, updates),
  categoryDelete: (id) => ipcRenderer.invoke('category:delete', id),

  // Tags
  tagList: () => ipcRenderer.invoke('tag:list'),
  tagCreate: (tag) => ipcRenderer.invoke('tag:create', tag),
  tagDelete: (id) => ipcRenderer.invoke('tag:delete', id),
})
