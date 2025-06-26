<!-- 供应商资金流水页面 -->
<template>
  <div class="merchant-prepaid-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="流水单号：">
            <el-input v-model="searchForm.transactionNo" placeholder="流水单号" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="交易类型：">
            <el-select v-model="searchForm.transactionType" placeholder="请选择" style="width: 168px" clearable>
              <el-option v-for="item in transactionTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="商户账号：">
            <el-select 
              v-model="searchForm.merchantIds" 
              placeholder="请选择" 
              style="width: 220px" 
              multiple 
              filterable 
              clearable
              collapse-tags
              collapse-tags-tooltip
            >
              <el-option v-for="item in merchantOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围：">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
              value-format="YYYY-MM-DD"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>
          
          <div class="filter-buttons">
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="mt-16">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <!-- 表格左侧工具栏，为空 -->
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="fetchData" />
          </el-tooltip>
        </div>
      </div>
      
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="50" fixed="left" />
        <el-table-column prop="upstreamName" label="商户账号" min-width="100" />
        <el-table-column prop="transactionNo" label="流水单号" min-width="180" />
        <el-table-column label="交易前" min-width="180">
          <template #default="scope">
            <div>余额: {{ formatAmount(scope.row.beforeTotal) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="transactionAmount" label="交易金额" min-width="100">
          <template #default="scope">
            {{ formatAmount(scope.row.transactionAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="transactionType" label="交易类型" min-width="100" />
        <el-table-column label="交易后" min-width="180">
          <template #default="scope">
            <div>余额: {{ formatAmount(scope.row.afterTotal) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
        <el-table-column prop="createTime" label="完成时间" min-width="150" />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 交易类型选项
const transactionTypeOptions = ref([
  { label: '余额扣减', value: '余额扣减' },
  { label: '余额增加', value: '余额增加' }
])

// 商户选项
const merchantOptions = [
  { label: '商户账号A', value: 'merchantA' },
  { label: '商户账号B', value: 'merchantB' },
  { label: '商户账号C', value: 'merchantC' },
  { label: '测试账号', value: 'test' }
]

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: (() => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    })()
  },
  {
    text: '最近一个月',
    value: (() => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    })()
  },
  {
    text: '最近三个月',
    value: (() => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    })()
  }
]

// 搜索表单
const searchForm = reactive({
  transactionNo: '',
  transactionType: '',
  merchantIds: [],
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    upstreamName: '商户账号B',
    transactionNo: 'MJK202410311552458103063619',
    beforeTotal: 658468.10,
    beforeAvailable: 658468.10,
    beforeFrozen: 0.00,
    transactionAmount: 500.00,
    transactionType: '余额增加',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 658968.10,
    afterAvailable: 658968.10,
    afterFrozen: 0.00,
    remark: '人工进行余额操作时输入的备注',
    createTime: '2025-03-29 14:54:37'
  },
  {
    upstreamName: '商户账号A',
    transactionNo: 'MJK202410311552458103063618',
    beforeTotal: 658968.10,
    beforeAvailable: 658968.10, 
    beforeFrozen: 0.00,
    transactionAmount: 30.00,
    transactionType: '余额扣减',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 658938.10,
    afterAvailable: 658938.10,
    afterFrozen: 0.00,
    remark: '人工进行余额操作时输入的备注',
    createTime: '2025-03-28 15:21:33'
  }
])

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(50)

// 获取数据
const fetchData = () => {
  loading.value = true
  
  // 模拟异步请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 格式化金额
const formatAmount = (amount) => {
  if (amount === undefined || amount === null) {
    return '0.00'
  }
  return amount.toFixed(2)
}

// 搜索与重置
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  // 重置搜索表单
  Object.keys(searchForm).forEach(key => {
    if (key === 'dateRange' || key === 'merchantIds') {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  currentPage.value = 1
  fetchData()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

// 导出数据
const handleExport = () => {
  ElMessage.success('正在导出数据，请稍候...')
  
  // 模拟导出
  setTimeout(() => {
    ElMessage.success('数据导出成功')
  }, 1500)
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.merchant-prepaid-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  align-items: center;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.filter-buttons .el-button + .el-button {
  margin-left: 8px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
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

.table-toolbar .right .el-button {
  margin-left: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.mt-16 {
  margin-top: 16px;
}
</style> 