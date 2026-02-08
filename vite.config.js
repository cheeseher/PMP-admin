import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),

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

    include: ['vue', 'vue-router', 'element-plus', '@element-plus/icons-vue']
  }
}) 