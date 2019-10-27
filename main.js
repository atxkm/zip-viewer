const { app, BrowserWindow } = require('electron');

function createWindow() {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // webSecurity: false,
      nodeIntegration: true,
    },
  });

  // 加载index.html文件
  win.loadFile('dist/zip-viewer/index.html');

  // 打开开发者工具
  // win.webContents.openDevTools();
}

app.on('ready', createWindow);
