import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import fs from 'fs'

// 创建自定义插件以处理Markdown文件
function copyDocsPlugin() {
  return {
    name: 'copy-markdown-docs',
    buildStart() {
      // 确保public/docs目录存在
      const publicDocsDir = resolve(__dirname, 'public/docs');
      if (!fs.existsSync(publicDocsDir)) {
        fs.mkdirSync(publicDocsDir, { recursive: true });
      }
    },
    handleHotUpdate({ file, server }) {
      // 当src/components/docs中的markdown文件改变时
      if (file.includes('/src/components/docs/') && file.endsWith('.md')) {
        const relativePath = file.split('/src/components/docs/')[1];
        const targetDir = resolve(__dirname, 'public/docs', relativePath.substring(0, relativePath.lastIndexOf('/')));
        const targetFile = resolve(__dirname, 'public/docs', relativePath);
        
        // 确保目标目录存在
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // 复制文件
        fs.copyFileSync(file, targetFile);
        console.log(`[vite] 文档文件已同步: ${relativePath}`);
        
        // 通知客户端刷新
        server.ws.send({
          type: 'full-reload'
        });
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    copyDocsPlugin() // 添加自定义插件
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  build: {
    // 防止文件名带有哈希值导致无法找到
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router'],
          'element-plus': ['element-plus'],
          'product': ['./src/views/product/ProductList.vue', './src/views/product/MerchantProductList.vue'],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 确保基础路径正确
    assetsDir: 'assets',
    // 调整chunk大小警告阈值
    chunkSizeWarningLimit: 1500,
    // 清理构建目录
    emptyOutDir: true,
    // 生成sourcemap帮助调试
    sourcemap: true
  },
  optimizeDeps: {
    exclude: ['./src/components/docs/order/merchant.md'],
    include: ['vue', 'vue-router', 'element-plus', '@element-plus/icons-vue']
  }
}) 