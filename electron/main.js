const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Database = require('better-sqlite3')

let db = null
let mainWindow = null

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'taskflow.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#8b5cf6'
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'todo' CHECK(status IN ('todo','in_progress','done','cancelled')),
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
      deadline TEXT,
      category_id TEXT,
      assignees TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
    CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category_id);
  `)

  // Migration: add assignees column if missing
  const cols = db.prepare(`PRAGMA table_info(tasks)`).all().map(c => c.name)
  if (!cols.includes('assignees')) {
    db.exec(`ALTER TABLE tasks ADD COLUMN assignees TEXT DEFAULT '[]'`)
  }
}

// --- IPC: Tasks ---
ipcMain.handle('task:list', (_, filters) => {
  let sql = `SELECT t.*, c.name as category_name, c.color as category_color FROM tasks t LEFT JOIN categories c ON t.category_id = c.id WHERE 1=1`
  const params = []

  if (filters) {
    if (filters.id) {
      sql += ` AND t.id = ?`
      params.push(filters.id)
    } else {
      if (filters.status) {
        sql += ` AND t.status = ?`
        params.push(filters.status)
      }
      if (filters.task_library) {
        sql += ` AND t.status IN ('todo', 'in_progress')`
      }
      if (filters.category_id) {
        sql += ` AND t.category_id = ?`
        params.push(filters.category_id)
      }
      if (filters.priority) {
        sql += ` AND t.priority = ?`
        params.push(filters.priority)
      }
      if (filters.today) {
        sql += ` AND date(t.deadline) = date('now','localtime')`
      }
      if (filters.important) {
        sql += ` AND t.priority IN ('high','urgent')`
      }
      if (filters.search) {
        sql += ` AND (t.title LIKE ? OR t.description LIKE ?)`
        params.push(`%${filters.search}%`, `%${filters.search}%`)
      }
    }
  }

  const orderBy = filters?.orderBy || 'deadline ASC'
  if (!filters?.id) sql += ` ORDER BY ${orderBy}`

  const tasks = db.prepare(sql).all(...params)

  const tagStmt = db.prepare(`SELECT tg.* FROM tags tg JOIN task_tags tt ON tg.id = tt.tag_id WHERE tt.task_id = ?`)
  for (const task of tasks) {
    task.tags = tagStmt.all(task.id)
    try {
      task.assignees = JSON.parse(task.assignees || '[]')
    } catch {
      task.assignees = []
    }
  }

  return tasks
})

ipcMain.handle('task:create', (_, task) => {
  const id = task.id || require('uuid').v4()
  const now = new Date().toISOString()
  const assigneesJson = JSON.stringify(task.assignees || [])
  db.prepare(`INSERT INTO tasks (id, title, description, status, priority, deadline, category_id, assignees, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, task.title, task.description || '', task.status || 'todo', task.priority || 'medium', task.deadline || null, task.category_id || null, assigneesJson, now, now)

  if (task.tag_ids && task.tag_ids.length > 0) {
    const insertTag = db.prepare(`INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)`)
    for (const tagId of task.tag_ids) {
      insertTag.run(id, tagId)
    }
  }

  return { id, ...task, created_at: now, updated_at: now }
})

ipcMain.handle('task:update', (_, id, updates) => {
  const fields = []
  const params = []
  for (const [key, value] of Object.entries(updates)) {
    if (['title', 'description', 'status', 'priority', 'deadline', 'category_id', 'assignees'].includes(key)) {
      fields.push(`${key} = ?`)
      params.push(key === 'assignees' ? JSON.stringify(value) : value)
    }
  }
  if (fields.length === 0) return null

  fields.push(`updated_at = datetime('now','localtime')`)
  params.push(id)
  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...params)

  // Handle tag updates
  if (updates.tag_ids !== undefined) {
    db.prepare(`DELETE FROM task_tags WHERE task_id = ?`).run(id)
    const insertTag = db.prepare(`INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)`)
    for (const tagId of updates.tag_ids) {
      insertTag.run(id, tagId)
    }
  }

  return { id }
})

ipcMain.handle('task:delete', (_, id) => {
  db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id)
  return { success: true }
})

// --- IPC: Categories ---
ipcMain.handle('category:list', () => {
  return db.prepare(`SELECT * FROM categories ORDER BY sort_order ASC`).all()
})

ipcMain.handle('category:create', (_, cat) => {
  const id = cat.id || require('uuid').v4()
  db.prepare(`INSERT INTO categories (id, name, color, sort_order) VALUES (?, ?, ?, ?)`)
    .run(id, cat.name, cat.color || '#6366f1', cat.sort_order || 0)
  return { id, ...cat }
})

ipcMain.handle('category:update', (_, id, updates) => {
  const fields = []
  const params = []
  for (const [key, value] of Object.entries(updates)) {
    if (['name', 'color', 'sort_order'].includes(key)) {
      fields.push(`${key} = ?`)
      params.push(value)
    }
  }
  if (fields.length === 0) return null
  params.push(id)
  db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...params)
  return { id }
})

ipcMain.handle('category:delete', (_, id) => {
  db.prepare(`DELETE FROM categories WHERE id = ?`).run(id)
  return { success: true }
})

// --- IPC: Tags ---
ipcMain.handle('tag:list', () => {
  return db.prepare(`SELECT * FROM tags ORDER BY name ASC`).all()
})

ipcMain.handle('tag:create', (_, tag) => {
  const id = tag.id || require('uuid').v4()
  db.prepare(`INSERT INTO tags (id, name, color) VALUES (?, ?, ?)`)
    .run(id, tag.name, tag.color || '#8b5cf6')
  return { id, ...tag }
})

ipcMain.handle('tag:delete', (_, id) => {
  db.prepare(`DELETE FROM tags WHERE id = ?`).run(id)
  return { success: true }
})

// --- Window ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1e1e2e',
      symbolColor: '#cdd6f4',
      height: 36,
    },
    show: false,
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  initDatabase()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
  if (db) db.close()
})
