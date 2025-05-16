import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chokidar from 'chokidar';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 同步单个文件
function syncFile(srcPath) {
  try {
    // 获取相对路径
    const relativePath = path.relative(path.join(__dirname, 'src/components/docs'), srcPath);
    const destPath = path.join(__dirname, 'public/docs', relativePath);
    
    // 确保目标目录存在
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // 复制文件
    fs.copyFileSync(srcPath, destPath);
    console.log(`已同步: ${relativePath}`);
  } catch (err) {
    console.error(`同步失败: ${srcPath}`, err);
  }
}

// 删除同步的文件
function removeFile(srcPath) {
  try {
    const relativePath = path.relative(path.join(__dirname, 'src/components/docs'), srcPath);
    const destPath = path.join(__dirname, 'public/docs', relativePath);
    
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
      console.log(`已删除: ${relativePath}`);
    }
  } catch (err) {
    console.error(`删除失败: ${srcPath}`, err);
  }
}

// 初始化目标目录
if (!fs.existsSync(path.join(__dirname, 'public/docs'))) {
  fs.mkdirSync(path.join(__dirname, 'public/docs'), { recursive: true });
}

// 初始化时同步所有文件
function initialSync() {
  const srcDir = path.join(__dirname, 'src/components/docs');
  if (!fs.existsSync(srcDir)) return;
  
  const files = [];
  function walkDir(dir) {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        walkDir(res);
      } else if (dirent.isFile() && path.extname(res) === '.md') {
        files.push(res);
      }
    }
  }
  
  walkDir(srcDir);
  console.log(`发现 ${files.length} 个Markdown文件`);
  
  files.forEach(file => {
    syncFile(file);
  });
}

// 执行初始同步
initialSync();

// 监视源目录变化
const watcher = chokidar.watch('src/components/docs/**/*.md', {
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('add', path => syncFile(path))
  .on('change', path => syncFile(path))
  .on('unlink', path => removeFile(path));

console.log('文档同步服务已启动，按Ctrl+C退出'); 