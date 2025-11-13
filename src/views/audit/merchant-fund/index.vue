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
        <el-table-column prop="merchantName" label="商户账号" min-width="100" />
        <el-table-column prop="transactionNo" label="平台单号" min-width="180" />
        <el-table-column prop="flowNo" label="流水单号" min-width="180" />
        <el-table-column label="交易前" min-width="180">
          <template #default="scope">
            <div>余额: {{ formatAmount(scope.row.beforeTotal) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="transactionAmount" label="交易金额" min-width="100">
          <template #default="scope">
            <span :style="{ color: scope.row.transactionAmount >= 0 ? '#67c23a' : '#f56c6c' }">
              {{ scope.row.transactionAmount >= 0 ? '+' : '' }}{{ formatAmount(scope.row.transactionAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="transactionType" label="交易类型" min-width="100" />
        <el-table-column prop="fee" label="手续费" min-width="100">
          <template #default="scope">
            {{ formatAmount(scope.row.fee) }}
          </template>
        </el-table-column>
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
const transactionTypeOptions = [
  { label: '收款', value: 'income' },
  { label: '交易撤销', value: 'cancel' },
  { label: '余额增加', value: 'balance_increase' },
  { label: '余额扣减', value: 'balance_decrease' },
  { label: '修改金额', value: 'amount_change' },
  { label: '修改金额冲账', value: 'amount_change_reverse' },
  { label: '失败返还', value: 'fail_return' },
  { label: '下发', value: 'payout' }
]

// 商户选项
const merchantOptions = [
  { label: '测试商户A', value: 'testA' },
  { label: '测试商户B', value: 'testB' },
  { label: '商户C账号', value: 'testC' },
  { label: '商户D账号', value: 'testD' },
  { label: '商户E账号', value: 'testE' }
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
    merchantName: '测试商户A',
    transactionNo: '',
    beforeTotal: 1000.00,
    beforeAvailable: 1000.00,
    beforeFrozen: 0.00,
    transactionAmount: -500.00,
    transactionType: '下发',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 495.00,
    afterAvailable: 495.00,
    afterFrozen: 0.00,
    remark: '资金下发处理',
    flowNo: 'MJK202503301426001008',
    createTime: '2025-03-30 14:26:00'
  },
  {
    merchantName: '测试商户A',
    transactionNo: 'P202503301425001234',
    beforeTotal: 856.00,
    beforeAvailable: 856.00,
    beforeFrozen: 0.00,
    transactionAmount: 120.00,
    transactionType: '修改金额',
    fee: 2.40,
    freezeAmount: 0.00,
    afterTotal: 976.00,
    afterAvailable: 976.00,
    afterFrozen: 0.00,
    remark: '订单金额修改',
    flowNo: 'MJK202503301425001001',
    createTime: '2025-03-30 14:25:00'
  },
  {
    merchantName: '测试商户A',
    transactionNo: 'P202503301424001234',
    beforeTotal: 956.00,
    beforeAvailable: 956.00,
    beforeFrozen: 0.00,
    transactionAmount: -100.00,
    transactionType: '修改金额冲账',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 856.00,
    afterAvailable: 856.00,
    afterFrozen: 0.00,
    remark: '原订单金额冲账',
    flowNo: 'MJK202503301424001000',
    createTime: '2025-03-30 14:24:00'
  },
  {
    merchantName: '测试商户A',
    transactionNo: 'P202503291044001234',
    beforeTotal: 865.10,
    beforeAvailable: 865.10,
    beforeFrozen: 0.00,
    transactionAmount: 90.90,
    transactionType: '收款',
    fee: 1.82,
    freezeAmount: 0.00,
    afterTotal: 956.00,
    afterAvailable: 956.00,
    afterFrozen: 0.00,
    remark: '',
    flowNo: 'MJK202503291044001001',
    createTime: '2025-03-29 10:44:52'
  },
  {
    merchantName: '商户C账号',
    transactionNo: 'P202503291030001235',
    beforeTotal: 965.10,
    beforeAvailable: 965.10,
    beforeFrozen: 0.00,
    transactionAmount: -100.00,
    transactionType: '交易撤销',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 865.10,
    afterAvailable: 865.10,
    afterFrozen: 0.00,
    remark: '',
    flowNo: 'MJK202503291030001002',
    createTime: '2025-03-29 10:30:00'
  },
  {
    merchantName: '商户C账号',
    transactionNo: 'P202503291000001235',
    beforeTotal: 865.10,
    beforeAvailable: 865.10,
    beforeFrozen: 0.00,
    transactionAmount: 100.00,
    transactionType: '收款',
    fee: 1.00,
    freezeAmount: 0.00,
    afterTotal: 965.10,
    afterAvailable: 965.10,
    afterFrozen: 0.00,
    remark: '',
    flowNo: 'MJK202503291000001003',
    createTime: '2025-03-29 10:00:00'
  },
  {
    merchantName: '商户D账号',
    transactionNo: 'P202503281533001236',
    beforeTotal: 415.10,
    beforeAvailable: 415.10,
    beforeFrozen: 0.00,
    transactionAmount: 450.00,
    transactionType: '修改金额',
    fee: 4.50,
    freezeAmount: 0.00,
    afterTotal: 865.10,
    afterAvailable: 865.10,
    afterFrozen: 0.00,
    remark: '',
    flowNo: 'MJK202503281533001004',
    createTime: '2025-03-28 15:33:45'
  },
  {
    merchantName: '测试商户B',
    transactionNo: '',
    beforeTotal: 315.10,
    beforeAvailable: 315.10,
    beforeFrozen: 0.00,
    transactionAmount: 100.00,
    transactionType: '余额增加',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 415.10,
    afterAvailable: 415.10,
    afterFrozen: 0.00,
    remark: '人工进行余额操作时输入的备注',
    flowNo: 'MJK202503281521001005',
    createTime: '2025-03-28 15:21:33'
  },
  {
    merchantName: '商户E账号',
    transactionNo: '',
    beforeTotal: 100.00,
    beforeAvailable: 100.00,
    beforeFrozen: 0.00,
    transactionAmount: 215.10,
    transactionType: '余额增加',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 315.10,
    afterAvailable: 315.10,
    afterFrozen: 0.00,
    remark: '人工进行余额操作时输入的备注',
    flowNo: 'MJK202503270918001006',
    createTime: '2025-03-27 09:18:12'
  },
  {
    merchantName: '测试商户A',
    transactionNo: 'P202503301500001237',
    beforeTotal: 856.00,
    beforeAvailable: 856.00,
    beforeFrozen: 0.00,
    transactionAmount: 50.00,
    transactionType: '失败返还',
    fee: 0.00,
    freezeAmount: 0.00,
    afterTotal: 906.00,
    afterAvailable: 906.00,
    afterFrozen: 0.00,
    remark: '交易失败返还金额',
    flowNo: 'MJK202503301500001007',
    createTime: '2025-03-30 15:00:00'
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
    } else if (key === 'merchantIds') {
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