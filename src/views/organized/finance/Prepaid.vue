<template>
  <div class="prepaid-record-container">
    <!-- 搜索筛选区域 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" label-position="left" inline class="multi-line-filter-form">
        <div class="filter-line">
          <el-form-item label="备注：">
            <el-input
              v-model="searchForm.remark"
              placeholder="请输入备注"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          
          <el-form-item label="时间筛选：">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
              style="width: 320px"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <div class="filter-buttons">
            <el-button plain @click="handleReset">重置</el-button>
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
        </div>
      </el-form>
    </el-card>
    
    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <div class="left">
          <!-- 移除日期显示 -->
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
        </div>
      </div>
      
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-show="tableData.length > 0"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="transactionNo" label="流水单号" min-width="180" />
        <el-table-column prop="prePaidAmount" label="变更前预付" min-width="120" align="right">
          <template #default="scope">
            <span>¥{{ formatAmount(scope.row.prePaidAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="changeAmount" label="变更金额" min-width="120" align="right">
          <template #default="scope">
            <span :style="{ color: scope.row.changeAmount >= 0 ? '#67c23a' : '#f56c6c' }">
              ¥{{ scope.row.changeAmount >= 0 ? '+' : '' }}{{ formatAmount(scope.row.changeAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="afterPaidAmount" label="变更后预付" min-width="120" align="right">
          <template #default="scope">
            <span>¥{{ formatAmount(scope.row.afterPaidAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" min-width="100" align="center">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" />
        <el-table-column prop="operateTime" label="完成时间" min-width="150" />
      </el-table>
      
      <!-- 无数据显示 -->
      <el-empty v-if="tableData.length === 0" description="暂无数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今日',
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: '昨日',
    value: () => {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setTime(today.getTime() - 3600 * 1000 * 24)
      return [yesterday, yesterday]
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(end.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 搜索表单
const searchForm = ref({
  remark: '',
  dateRange: []
})

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    transactionNo: 'MJK202503251415301001',
    prePaidAmount: 5000.00,
    changeAmount: -1000.00,
    afterPaidAmount: 4000.00,
    type: '扣减',
    remark: '人工进行余额操作时输入的备注',
    operateTime: '2025-03-25 14:15:30'
  },
  {
    transactionNo: 'MJK202503260922151002',
    prePaidAmount: 3000.00,
    changeAmount: 2000.00,
    afterPaidAmount: 5000.00,
    type: '增加',
    remark: '人工进行余额操作时输入的备注',
    operateTime: '2025-03-26 09:22:15'
  },
  {
    transactionNo: 'MJK202503271635421003',
    prePaidAmount: 10000.00,
    changeAmount: -3000.00,
    afterPaidAmount: 7000.00,
    type: '扣减',
    remark: '人工进行余额操作时输入的备注',
    operateTime: '2025-03-27 16:35:42'
  }
])

// 选中行
const selectedRows = ref([])

// 处理多选
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 格式化金额
const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return Number(amount).toFixed(2)
}

// 获取金额变更的CSS类
const getAmountClass = (amount) => {
  if (amount > 0) return 'positive-amount'
  if (amount < 0) return 'negative-amount'
  return ''
}

// 获取类型标签的类型
const getTypeTagType = (type) => {
  const typeMap = {
    '增加': 'success',
    '扣减': 'danger'
  }
  return typeMap[type] || 'info'
}

// 搜索
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    ElMessage.success('查询成功')
    loading.value = false
  }, 500)
  // 实际应用中这里应该调用API获取数据
}

// 重置
const handleReset = () => {
  searchForm.value = {
    remark: '',
    dateRange: []
  }
}

// 导出
const handleExport = () => {
  if (selectedRows.value.length > 0) {
    ElMessage.success(`已导出 ${selectedRows.value.length} 条记录`)
  } else {
    ElMessage.success('已导出全部数据')
  }
  // 实际应用中这里应该调用API导出数据
}

// 页面加载时初始化
onMounted(() => {
  // 默认今天
  searchForm.value.dateRange = dateShortcuts[0].value()
})
</script>

<style scoped>
.prepaid-record-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.multi-line-filter-form {
  width: 100%;
}

.multi-line-filter-form .filter-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
  row-gap: 12px;
}

.multi-line-filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 16px;
  display: flex;
  align-items: center;
}

.multi-line-filter-form .el-form-item__label {
  line-height: 32px;
  white-space: nowrap;
  width: auto !important;
  padding-right: 6px;
}

.filter-buttons {
  display: flex;
  margin-left: auto;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.table-card {
  margin-bottom: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
}

.table-toolbar .right {
  display: flex;
  align-items: center;
}

.positive-amount {
  color: #67C23A;
}

.negative-amount {
  color: #F56C6C;
}
</style> 