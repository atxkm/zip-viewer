const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const Path = require('path');
const crypto = require('crypto');

let win;

function createWindow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // webSecurity: false,
      nodeIntegration: true,
    },
  });

  // 加载index.html文件
  win.loadFile('dist/zip-viewer/index.html');
  // win.loadURL('http://localhost:4200');

  // 打开开发者工具
  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

function sendToWin(arg) {
  win.webContents.send('message', arg);
}

function log(...arg) {
  sendToWin({ type: 'log', data: [...arg] });
}

function onFolderChange(path) {
  try {
    fs.readdirSync(path);
  } catch (e) {
    sendToWin({ type: 'isNotFolder' });
  }
}

// 主进程监听渲染进程传来的信息
ipcMain.on('message', (e, message) => {
  const type = message.type;
  switch (type) {
    case 'changeFolder':
      onFolderChange(message.data);
      break;
    case 'analyseFolder':
      analyseFolder(message.data);
  }
});

function analyseFolder(data) {
  const dir = data.path;
  const password = data.password;
  const files = fs.readdirSync(dir);
  files.forEach(item => {
    const fPath = Path.join(dir, item);
    const stat = fs.statSync(fPath);
    if (stat.isDirectory() === true) {
      analyseFolder({ path: fPath, password });
    } else {
      doDecrypt(fPath, password);
    }
  });
}

// 第二步
function doDecrypt(path, password) {
  const stat = fs.statSync(path);
  if (stat.size > 1024 * 1024 * 60) {// 大文件解密(异或)
    encryptBigFile(path, password);// 对应第四步
  } else {
    decryptIniFile(path, password);
  }
}

// 第四步
function encryptBigFile(path, password) {
  const bytes = fs.readFileSync(path);
  const key = hashcode(password);
  for (let i = 0; i < 16 * 1024; i++) {
    bytes[i] ^= key;
  }
  writeFile(path, bytes);
}

function hashcode(str) {
  let hash = 0,
      i,
      chr,
      len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}


// 第五步
function decryptIniFile(path, password) {
  const bytes = fs.readFileSync(path);
  const decryptBytes = decrypt(bytes, password);
  writeFile(Path.join(path), decryptBytes);
}

// 第七步
function decrypt(content, password) {
  const md5Key = crypto.createHash('md5').update(password).digest('hex');
  const key = new Buffer(md5Key, 'utf8');
  const cipher = crypto.createDecipheriv('aes-256-ecb', key, new Buffer(''));
  return cipher.update(content, 'utf8', 'hex') + cipher.final('hex');
}

function writeFile(path, data) {
  const fileName = Path.basename(path);
  let srcAllPath;
  if (fileName.indexOf('%&') != -1) {// 加密时使用"%&"替代了反斜杠，现在解密时替换回来
    srcAllPath = fileName.replace(/%&/g, Path.sep);
  }
  path = Path.join(Path.dirname(Path.dirname(path)), 'decryptData');
  const dir = Path.join(path, Path.dirname(srcAllPath));
  fs.mkdirSync(dir, { recursive: true });
  const filePath = Path.join(path, srcAllPath);
  fs.writeFileSync(filePath, data);
}
