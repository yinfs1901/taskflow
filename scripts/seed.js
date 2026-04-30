// Seed 100 test tasks with dates from 04-01 to 04-29
const path = require('path')
const Database = require('better-sqlite3')
const { v4: uuidv4 } = require('uuid')

const dbPath = path.join(process.env.APPDATA || '.', 'taskflow', 'taskflow.db')
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

// Ensure assignees column exists
const cols = db.prepare(`PRAGMA table_info(tasks)`).all().map(c => c.name)
if (!cols.includes('assignees')) {
  db.exec(`ALTER TABLE tasks ADD COLUMN assignees TEXT DEFAULT '[]'`)
}

const priorities = ['low', 'medium', 'high', 'urgent']
const statuses = ['todo', 'in_progress', 'done']
const names = ['张三', '李四', '王五', '赵六', '陈七', '孙八', '周九', '吴十']

// Clear existing tasks
db.prepare(`DELETE FROM task_tags`).run()
db.prepare(`DELETE FROM tasks`).run()

const insert = db.prepare(`
  INSERT INTO tasks (id, title, description, status, priority, deadline, category_id, assignees, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const insertTag = db.prepare(`INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)`)

let count = 0

// Generate 100 tasks spread across 04-01 to 04-29
for (let i = 1; i <= 100; i++) {
  // Day from 1 to 29 (04-01 to 04-29)
  const day = ((i - 1) % 29) + 1
  const month = '04'
  const paddedDay = String(day).padStart(2, '0')
  const paddedHour = String((i % 24)).padStart(2, '0')
  const paddedMin = String((i * 37) % 60).padStart(2, '0')

  const createdAt = `2026-${month}-${paddedDay}T${paddedHour}:${paddedMin}:00.000`
  const updatedAt = createdAt

  // ~70% of tasks have a deadline in the same month or early May
  const hasDeadline = i % 10 < 7
  let deadline = null
  if (hasDeadline) {
    const dday = Math.min(29, day + Math.floor(i / 20) - 2)
    deadline = `2026-${month}-${String(Math.max(1, dday)).padStart(2, '0')}T18:00:00.000`
  }

  const id = uuidv4()
  const title = `测试任务 ${String(i).padStart(3, '0')}`
  const description = `这是第 ${i} 条测试任务，用于验证任务管理系统的各项功能。`
  const status = statuses[i % 3]
  const priority = priorities[i % 4]

  // ~50% have 1-3 assignees
  const assignees = []
  if (i % 2 === 0) {
    const numAssignees = (i % 3) + 1
    let remaining = 100
    for (let j = 0; j < numAssignees; j++) {
      const ratio = j === numAssignees - 1 ? remaining : Math.floor(Math.random() * (remaining - (numAssignees - j - 1))) + 1
      remaining -= ratio
      assignees.push({ name: names[(i + j) % names.length], ratio })
    }
  }

  insert.run(
    id, title, description, status, priority, deadline,
    null, JSON.stringify(assignees), createdAt, updatedAt
  )

  count++
}

console.log(`Inserted ${count} tasks successfully.`)

const row = db.prepare(`SELECT COUNT(*) as cnt, MIN(created_at) as min_date, MAX(created_at) as max_date FROM tasks`).get()
console.log(`Total: ${row.cnt}, Date range: ${row.min_date} ~ ${row.max_date}`)

db.close()
