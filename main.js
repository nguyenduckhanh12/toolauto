const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { startAll, exportCSV } = require('./puppeteer-helper'); // <<< Thêm dòng này

function createWindow() {
    const win = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  
    win.loadFile('index.html');
    
    // Thêm dòng này để mở DevTools
    // win.webContents.openDevTools();
  
    ipcMain.on('start-auto', () => {
      console.log("Start button clicked");
      startAll(win);
    });
  
    ipcMain.on('export-csv', () => {
      console.log("Export button clicked");
      exportCSV();
    });
  }
  

app.whenReady().then(() => {
  createWindow();
});
