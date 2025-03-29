<!-- 商户资金流水页面 -->
<template>
  <div class="merchant-fund-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="平台单号：">
            <el-input v-model="searchForm.transactionNo" placeholder="平台单号" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="交易类型：">
            <el-select v-model="searchForm.transactionType" placeholder="请选择" style="width: 168px" clearable>
              <el-option v-for="item in transactionTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="商户账号：">
            <el-select v-model="searchForm.merchantId" placeholder="请选择" style="width: 168px" clearable>
              <el-option v-for="item in merchantOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态：">
            <el-select v-model="searchForm.status" placeholder="请选择" style="width: 168px" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        <el-table-column prop="merchantName" label="商户" min-width="100" />
        <el-table-column prop="transactionNo" label="平台单号" min-width="180" />
        <el-table-column prop="flowNo" label="流水单号" min-width="180" />
        <el-table-column label="交易前" min-width="180">
          <template #default="scope">
            <div>总额: {{ formatAmount(scope.row.beforeTotal) }}</div>
            <div>可用: {{ formatAmount(scope.row.beforeAvailable) }}</div>
            <div>冻结: {{ formatAmount(scope.row.beforeFrozen) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="transactionAmount" label="交易金额" min-width="100">
          <template #default="scope">
            {{ formatAmount(scope.row.transactionAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="transactionType" label="交易类型" min-width="100" />
        <el-table-column prop="fee" label="手续费" min-width="100">
          <template #default="scope">
            {{ formatAmount(scope.row.fee) }}
          </template>
        </el-table-column>
        <el-table-column prop="freezeAmount" label="冻结金额" min-width="100">
          <template #default="scope">
            {{ formatAmount(scope.row.freezeAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="交易后" min-width="180">
          <template #default="scope">
            <div>总额: {{ formatAmount(scope.row.afterTotal) }}</div>
            <div>可用: {{ formatAmount(scope.row.afterAvailable) }}</div>
            <div>冻结: {{ formatAmount(scope.row.afterFrozen) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="80">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              size="small"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
        <el-table-column prop="createTime" label="时间" min-width="150" />
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
const transactionTypeOptions = [
  { label: '收款', value: 'income' },
  { label: '交易撤销', value: 'cancel' }
]

// 商户选项
const merchantOptions = [
  { label: '测试商户', value: 'test' }
]

// 状态选项
const statusOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' }
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
  merchantId: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    merchantName: '测试',
    transactionNo: 'P202503251139111459862767',
    beforeTotal: 741564.00,
    beforeAvailable: 741564.00,
    beforeFrozen: 0.00,
    transactionAmount: 90.90,
    transactionType: '收款',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 741655.00,
    afterAvailable: 741655.00,
    afterFrozen: 0.00,
    status: '成功',
    remark: '',
    flowNo: 'F202503251139111459862001',
    createTime: '2025-03-29 10:44:52'
  },
  {
    merchantName: '测试',
    transactionNo: 'P202503251139111459862767',
    beforeTotal: 741654.00,
    beforeAvailable: 741654.00,
    beforeFrozen: 0.00,
    transactionAmount: 90.90,
    transactionType: '交易撤销',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 741564.00,
    afterAvailable: 741564.00,
    afterFrozen: 0.00,
    status: '成功',
    remark: '',
    flowNo: 'F202503251139111459862002',
    createTime: '2025-03-29 10:44:52'
  },
  {
    merchantName: '测试',
    transactionNo: 'P202410311552555619957777',
    beforeTotal: 741204.00,
    beforeAvailable: 741204.00,
    beforeFrozen: 0.00,
    transactionAmount: 450.00,
    transactionType: '收款',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 741654.00,
    afterAvailable: 741654.00,
    afterFrozen: 0.00,
    status: '成功',
    remark: '',
    flowNo: 'F202410311552555619957003',
    createTime: '2025-03-29 10:33:45'
  }
])

const loading = ref(false)

// 分页
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

// 获取状态对应的类型
const getStatusType = (status) => {
  const typeMap = {
    '成功': 'success',
    '失败': 'danger'
  }
  return typeMap[status] || 'info'
}

// 搜索与重置
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  // 重置搜索表单
  Object.keys(searchForm).forEach(key => {
    if (key === 'dateRange') {
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
.merchant-fund-container {
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