<template>
  <div class="upstream-channel">
    <!-- 页面内容区域 -->
    <el-card class="content-card" shadow="never">
      <div class="empty-content">
        <el-empty description="页面内容待开发" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 页面数据
const loading = ref(false)

</script>

<style scoped>
.upstream-channel {
  padding: 20px;
}

.content-card {
  min-height: 400px;
}

.empty-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
</style>