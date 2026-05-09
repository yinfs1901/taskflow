const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  console.log('Creating window...')
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
    webPreferences: {
      nodeIntegration: true
    }
  })
  
  win.loadURL('data:text/html,<h1 style="color:white;background:#1e1e2e;height:100vh;margin:0;display:flex;align-items:center;justify-content:center;">Electron OK</h1>')
    .then(() => console.log('Page loaded'))
    .catch(err => console.error('Load error:', err))
  
  win.on('closed', () => console.log('Window closed'))
}

app.whenReady().then(() => {
  console.log('App ready')
  createWindow()
})

app.on('window-all-closed', () => {
  console.log('All windows closed')
  app.quit()
})
