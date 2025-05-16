<template>
  <div class="page-documentation-fab">
    <el-button
      type="primary"
      :icon="Document"
      circle
      size="large"
      @click="openDocumentation"
      title="查看页面文档"
    />
    <el-dialog
      v-model="dialogVisible"
      title="页面文档说明"
      width="60%"
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="documentation-content">
        <div v-if="documentationContent" v-html="documentationContent"></div>
        <el-empty v-else description="暂无文档"></el-empty>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Document } from '@element-plus/icons-vue';
import MarkdownIt from 'markdown-it';

const dialogVisible = ref(false);
const documentationContent = ref('');
const route = useRoute();
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// 获取当前路由路径并格式化为可能的文档路径
const getCurrentDocPath = () => {
  const path = route.path === '/' ? '/index' : route.path;
  // 移除开头的斜杠，并将所有斜杠替换为横杠以形成文件名
  const flatPath = path.substring(1).replace(/\//g, '-');
  // 保留目录结构的路径
  const structuredPath = path.substring(1);
  
  return {
    flatPath, // 如: 'user-settings'
    structuredPath // 如: 'user/settings'
  };
};

// 加载文档内容
const loadDocumentation = async () => {
  try {
    const { flatPath, structuredPath } = getCurrentDocPath();
    let docContent = null;
    
    console.log('当前路径:', route.path);
    console.log('扁平路径:', flatPath);
    console.log('结构化路径:', structuredPath);
    
    // 尝试几种可能的文件位置 
    const possiblePaths = [
      // 优先尝试从public/docs加载
      `/docs/${flatPath}.md`,
      `/docs/${structuredPath}.md`,
      `/docs/${structuredPath}/index.md`,
      // 然后尝试从src/components/docs加载
      `@/components/docs/${flatPath}.md`,
      `@/components/docs/${structuredPath}.md`, 
      `@/components/docs/${structuredPath}/index.md`,
      // 最后尝试从原始路径加载
      `./docs/${flatPath}.md`,
      `./docs/${structuredPath}.md`,
      `./docs/${structuredPath}/index.md`,
    ];
    
    // 对于根路径特殊处理
    if (flatPath === 'index') {
      possiblePaths.unshift('/docs/index.md');
    }
    
    // 特殊处理：对于order/merchant页面，直接尝试加载对应文档
    if (structuredPath === 'order/merchant') {
      possiblePaths.unshift('/docs/order/merchant.md');
    }
    
    console.log('尝试加载以下文档路径:', possiblePaths);
    
    // 首先尝试直接通过fetch获取文档
    try {
      const fetchPaths = possiblePaths.filter(p => p.startsWith('/docs/'));
      for (const fetchPath of fetchPaths) {
        console.log('尝试通过fetch加载文档:', fetchPath);
        const response = await fetch(fetchPath);
        if (response.ok) {
          docContent = await response.text();
          console.log('成功通过fetch加载文档:', fetchPath);
          break;
        }
      }
    } catch (err) {
      console.error('通过fetch加载文档失败:', err);
    }
    
    // 如果fetch失败，尝试通过import加载
    if (!docContent) {
      for (const path of possiblePaths) {
        if (path.startsWith('/docs/')) continue; // 已经通过fetch尝试过

        try {
          // 使用动态导入加载Markdown文件
          console.log('尝试通过import加载文档:', path);
          const content = await import(/* @vite-ignore */ path + '?raw');
          if (content.default) {
            console.log('成功通过import加载文档:', path);
            docContent = content.default;
            break;
          }
        } catch (err) {
          // 忽略文件不存在的错误，继续尝试下一个路径
          console.log('文档加载失败:', path, err.message);
          continue;
        }
      }
    }
    
    if (docContent) {
      // 将Markdown转换为HTML
      documentationContent.value = md.render(docContent);
      console.log('成功加载并渲染文档');
    } else {
      documentationContent.value = '';
      console.log('未找到文档文件');
    }
  } catch (error) {
    console.error('加载文档失败:', error);
    documentationContent.value = '';
  }
};

// 打开文档对话框
const openDocumentation = async () => {
  await loadDocumentation();
  dialogVisible.value = true;
};

// 监听路由变化，如果对话框已打开，则重新加载文档
watch(() => route.path, async (newPath, oldPath) => {
  if (dialogVisible.value && newPath !== oldPath) {
    await loadDocumentation();
  }
});

// 组件挂载时预加载当前页面的文档
onMounted(() => {
  // 这里可以选择是否预加载文档
  // loadDocumentation();
});
</script>

<style scoped>
.page-documentation-fab {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 1000; /* 确保在顶层 */
}

.documentation-content {
  min-height: 200px; /* 保证内容区域有一定高度 */
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 20px;
}

.documentation-content :deep(h1) {
  font-size: 24px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.documentation-content :deep(h2) {
  font-size: 20px;
  margin-top: 24px;
  margin-bottom: 12px;
}

.documentation-content :deep(h3) {
  font-size: 18px;
  margin-top: 20px;
  margin-bottom: 10px;
}

.documentation-content :deep(p) {
  line-height: 1.6;
  margin-bottom: 16px;
  color: #606266;
}

.documentation-content :deep(ul), .documentation-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 16px;
}

.documentation-content :deep(li) {
  line-height: 1.8;
  color: #606266;
}

.documentation-content :deep(blockquote) {
  padding: 8px 16px;
  border-left: 4px solid #ebeef5;
  background-color: #f8f8f9;
  margin: 16px 0;
  color: #909399;
}

.documentation-content :deep(code) {
  background-color: #f8f8f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #f56c6c;
}

.documentation-content :deep(pre) {
  background-color: #f8f8f9;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 16px 0;
}

.documentation-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: #606266;
}

.documentation-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.documentation-content :deep(th), .documentation-content :deep(td) {
  padding: 8px 12px;
  border: 1px solid #ebeef5;
  text-align: left;
}

.documentation-content :deep(th) {
  background-color: #f8f8f9;
  font-weight: bold;
}
</style> 