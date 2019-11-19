const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const Path = require('path');
const crypto = require('crypto');
const unzip = require('unzip-stream');
const XLSX = require('xlsx');

let win;
let fileNum = 0;
let overNum = 0;
let destRootDir; // 输出主目录

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
  // win.loadURL('http://localhost:4200').then();

  // 打开开发者工具
  // win.webContents.openDevTools();

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
      // log('start analyseFolder', moment().format('HH:mm:ss.SS'));
      fileNum = 0;
      overNum = 0;
      const data = message.data;
      const path = data.path;
      const password = data.password;
      destRootDir = Path.join(Path.dirname(path), 'decryptData'); // 目标目录
      analyseFolder(path, password);
      break;
    case 'getFiles':
      e.returnValue = getFiles(message.data.path);
      break;
    case 'exportExcel':
      exportExcel(message.data);
      break;
    case 'getImg':
      e.returnValue = getImg(message.data);
      break;
    default:
  }
});

function analyseFolder(path, password) {
  const files = fs.readdirSync(path);
  files.forEach(item => {
    const fPath = Path.join(path, item);
    const stat = fs.statSync(fPath);
    if (stat.isDirectory() === true) {
      analyseFolder(fPath, password);
    } else {
      const fileName = Path.basename(fPath);
      if (fileName.indexOf('%&') !== -1) {
        fileNum++; // 增加文件计数
        doDecrypt(fPath, password);
      }
    }
  });
}

// 第二步
function doDecrypt(fPath, password) {
  const stat = fs.statSync(fPath);
  if (stat.size > 1024 * 1024 * 60) {// 大文件解密(异或)
    encryptBigFile(fPath, password); // 对应第四步
  } else {
    decryptIniFile(fPath, password);
  }
}

// 第四步
function encryptBigFile(fPath, password) {
  const bytes = fs.readFileSync(fPath);
  const key = hashcode(password);
  for (let i = 0; i < 16 * 1024; i++) {
    bytes[i] ^= key;
  }
  writeFile(fPath, bytes);
}

function hashcode(str) {
  let hash = 0,
      i,
      chr,
      len;
  if (str.length === 0) {
    return hash;
  }
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// 第五步
function decryptIniFile(fPath, password) {
  const md5Key = crypto.createHash('md5').update(password).digest('hex');
  const key = Buffer.from(md5Key, 'utf-8');
  const cipher = crypto.createDecipheriv('aes-256-ecb', key, '');
  const input = fs.createReadStream(fPath);

  if (fPath.indexOf('.zip') < 0) {
    const fileName = Path.basename(fPath);
    const fPathD = getDestDir(fileName);
    const output = fs.createWriteStream(fPathD);
    input.pipe(cipher).pipe(output);
    sendPercent();

  } else {
    input.pipe(cipher).pipe(unzip.Parse()).on('entry', entry => {
      const fPathD = getDestDir(entry.path);
      return entry.pipe(fs.createWriteStream(fPathD));
    }).on('end', () => {
      sendPercent();
    });
  }
}

function writeFile(fPath, data) {
  const fileName = Path.basename(fPath);
  const fPathD = getDestDir(fileName);
  fs.writeFileSync(fPathD, data, { encoding: 'binary' });
  sendPercent();
}

function getDestDir(fileName) {
  let srcAllPath = fileName.replace(/%&/g, Path.sep);
  const dir = Path.join(destRootDir, Path.dirname(srcAllPath));
  fs.mkdirSync(dir, { recursive: true }); // 创建所有层级目录
  return Path.join(destRootDir, srcAllPath);
}

function sendPercent() {
  overNum++;
  // log(overNum, fileNum);
  const percent = Math.floor(overNum / fileNum * 100);
  sendToWin({ type: 'fileProgress', data: { percent } });
  if (overNum >= fileNum) {
    sendToWin({ type: 'fileOver', data: { path: destRootDir } });
  }
}

function getFiles(path) {
  let files = [];
  const paths = fs.readdirSync(path);
  for (const item of paths) {
    const fPath = Path.join(path, item);
    const stats = fs.statSync(fPath);
    const temp = {
      title: item,
      key: stats.ino,
      size: stats.size,
      mtime: stats.mtime,
      birthtime: stats.birthtime,
    };
    if (stats.isDirectory()) {
      temp.children = getFiles(fPath);
      if (temp.children.length === 0) {
        temp.isLeaf = true;
      }
    } else {
      temp.path = fPath;
      temp.isLeaf = true;
    }
    files.push(temp);
  }
  return files;
}

function exportExcel(data) {
  const book = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(data.data);
  XLSX.utils.book_append_sheet(book, sheet, '文件分析');
  const buffer = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
  const path = dialog.showSaveDialogSync({
    title: '请选择导出位置',
    defaultPath: Path.dirname(destRootDir) + Path.sep + `文件分析${new Date().getTime()}.xlsx`,
  });
  if (path) {
    fs.writeFileSync(path, buffer);
  }
}

function getImg(data) {
  const fPath = data.path;
  let file = '';
  if (fPath) {
    file = fs.readFileSync(fPath);
  }
  return Buffer.from(file).toString('base64');
}
