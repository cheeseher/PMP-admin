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
          
          <el-form-item label="时间：">
            <div class="time-filter-container">
              <el-select v-model="searchForm.timeType" placeholder="选择时间类型" style="width: 120px">
                <el-option label="自定义时间" value="custom" />
                <el-option label="今日" value="today" />
                <el-option label="昨日" value="yesterday" />
                <el-option label="最近7天" value="last7days" />
                <el-option label="本月" value="month" />
              </el-select>
              <el-date-picker
                v-if="searchForm.timeType === 'custom'"
                v-model="searchForm.timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 240px; margin-left: 8px;"
              />
            </div>
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
          <span class="date-display">查询日期: {{ displayDateRange }}</span>
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
        <el-table-column prop="merchantId" label="商户ID" min-width="100" />
        <el-table-column prop="merchantName" label="商户名称" min-width="150" />
        <el-table-column prop="prePaidAmount" label="变更前预付" min-width="120" align="right">
          <template #default="scope">
            <span>¥{{ formatAmount(scope.row.prePaidAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="changeAmount" label="变更金额" min-width="120" align="right">
          <template #default="scope">
            <span :class="getAmountClass(scope.row.changeAmount)">¥{{ formatAmount(scope.row.changeAmount) }}</span>
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
        <el-table-column prop="operateTime" label="操作时间" min-width="150" />
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

// 根据时间类型获取日期范围
const getDateRangeByType = (type) => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const formattedToday = `${year}-${month}-${day}`
  
  switch (type) {
    case 'today':
      return [formattedToday, formattedToday]
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const yYear = yesterday.getFullYear()
      const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0')
      const yDay = String(yesterday.getDate()).padStart(2, '0')
      const formattedYesterday = `${yYear}-${yMonth}-${yDay}`
      return [formattedYesterday, formattedYesterday]
    }
    case 'last7days': {
      const lastWeek = new Date(today)
      lastWeek.setDate(today.getDate() - 6)
      const lYear = lastWeek.getFullYear()
      const lMonth = String(lastWeek.getMonth() + 1).padStart(2, '0')
      const lDay = String(lastWeek.getDate()).padStart(2, '0')
      const formattedLastWeek = `${lYear}-${lMonth}-${lDay}`
      return [formattedLastWeek, formattedToday]
    }
    case 'month': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const fYear = firstDay.getFullYear()
      const fMonth = String(firstDay.getMonth() + 1).padStart(2, '0')
      const fDay = String(firstDay.getDate()).padStart(2, '0')
      const formattedFirstDay = `${fYear}-${fMonth}-${fDay}`
      return [formattedFirstDay, formattedToday]
    }
    default:
      return ['', '']
  }
}

// 搜索表单
const searchForm = ref({
  remark: '',
  timeType: 'today',
  timeRange: getDateRangeByType('today')
})

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    merchantId: '1001',
    merchantName: '商户A',
    prePaidAmount: 5000.00,
    changeAmount: -1000.00,
    afterPaidAmount: 4000.00,
    type: '扣减',
    remark: '系统预付金额调整',
    operateTime: '2025-03-25 14:15:30'
  },
  {
    merchantId: '1002',
    merchantName: '商户B',
    prePaidAmount: 3000.00,
    changeAmount: 2000.00,
    afterPaidAmount: 5000.00,
    type: '增加',
    remark: '商户预付金额充值',
    operateTime: '2025-03-26 09:22:15'
  },
  {
    merchantId: '1003',
    merchantName: '商户C',
    prePaidAmount: 10000.00,
    changeAmount: -3000.00,
    afterPaidAmount: 7000.00,
    type: '扣减',
    remark: '系统预付金额扣减',
    operateTime: '2025-03-27 16:35:42'
  }
])

// 选中行
const selectedRows = ref([])

// 处理多选
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 显示的日期范围
const displayDateRange = computed(() => {
  if (searchForm.value.timeType === 'custom' && searchForm.value.timeRange && searchForm.value.timeRange.length === 2) {
    return `${searchForm.value.timeRange[0]} ~ ${searchForm.value.timeRange[1]}`
  } else {
    const dateRange = getDateRangeByType(searchForm.value.timeType)
    return `${dateRange[0]} ~ ${dateRange[1]}`
  }
})

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
    timeType: 'today',
    timeRange: getDateRangeByType('today')
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

// 监听时间类型变化，自动设置日期范围
watch(() => searchForm.value.timeType, (newType) => {
  if (newType !== 'custom') {
    searchForm.value.timeRange = getDateRangeByType(newType)
  }
})

// 页面加载时初始化
onMounted(() => {
  // 默认今天
  searchForm.value.timeRange = getDateRangeByType('today')
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

/* 时间筛选容器样式 */
.time-filter-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.filter-buttons {
  display: flex;
  margin-left: auto;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.date-display {
  font-size: 14px;
  color: #606266;
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