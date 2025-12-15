<!-- 数据统计/商户支付排行 - 统计商户支付数据排名 -->
<template>
  <div class="merchant-rank-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" label-position="left" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="商户：">
            <el-select
              v-model="searchForm.merchantIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择商户"
              style="width: 220px"
              clearable
              filterable
            >
              <el-option
                v-for="item in merchantOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <div class="filter-buttons">
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">商户排行榜</span>
          <el-tag type="info" size="small" effect="plain">{{ total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="refreshData" />
          </el-tooltip>
        </div>
      </div>
      
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="排名" width="80" align="center">
          <template #default="scope">
            <el-tag 
              :type="getRankType(scope.$index)" 
              size="small" 
              effect="dark"
              class="rank-tag"
            >{{ scope.$index + 1 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="merchantId" label="商户ID" width="80" align="center" />
        <el-table-column prop="merchantNo" label="商户号" width="120" align="center" />
        <el-table-column prop="merchantAccount" label="商户账号" width="120" align="center" />
        <el-table-column prop="merchantName" label="商户名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="successAmount" label="成功收款金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.successAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.fee) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="netAmount" label="入账金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatAmount(row.netAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="成功单数/总笔数" width="150" align="center">
          <template #default="{ row }">
            <span>{{ formatNumber(row.successCount) }}/{{ formatNumber(row.orderCount) }}笔</span>
          </template>
        </el-table-column>
        <el-table-column prop="successRate" label="成功率" width="100" align="center">
          <template #default="{ row }">
            <span>{{ (row.successRate * 100).toFixed(2) }}%</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { Search, Refresh, Download, Money, Discount, Document, Wallet } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// 商户选项数据
const merchantOptions = ref([
  { value: '1001', label: '商户A' },
  { value: '1002', label: '商户B' },
  { value: '1003', label: '商户C' },
  { value: '1004', label: '商户D' },
  { value: '1005', label: '商户E' }
])

// 搜索表单数据
const searchForm = reactive({
  merchantIds: []
})

// 表格数据
const tableData = ref([
  {
    merchantId: '1',
    merchantNo: 'MER20240301',
    merchantAccount: 'merchant1',
    merchantName: '商户A',
    orderCount: 5000,
    successCount: 4850,
    successAmount: 2450000.00,
    successRate: 0.97,
    fee: 12250.00,
    netAmount: 2437750.00
  },
  {
    merchantId: '2',
    merchantNo: 'MER20240302',
    merchantAccount: 'merchant2',
    merchantName: '商户B',
    orderCount: 4200,
    successCount: 4116,
    successAmount: 1850000.00,
    successRate: 0.98,
    fee: 9250.00,
    netAmount: 1840750.00
  },
  {
    merchantId: '3',
    merchantNo: 'MER20240303',
    merchantAccount: 'merchant3',
    merchantName: '商户C',
    orderCount: 3600,
    successCount: 3492,
    successAmount: 1580000.00,
    successRate: 0.97,
    fee: 7900.00,
    netAmount: 1572100.00
  },
  {
    merchantId: '4',
    merchantNo: 'MER20240304',
    merchantAccount: 'merchant4',
    merchantName: '商户D',
    orderCount: 2800,
    successCount: 2604,
    successAmount: 980000.00,
    successRate: 0.93,
    fee: 4900.00,
    netAmount: 975100.00
  },
  {
    merchantId: '5',
    merchantNo: 'MER20240305',
    merchantAccount: 'merchant5',
    merchantName: '商户E',
    orderCount: 1200,
    successCount: 1128,
    successAmount: 560000.00,
    successRate: 0.94,
    fee: 2800.00,
    netAmount: 557200.00
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 初始化页面
onMounted(() => {
  fetchData()
})

// 获取数据
const fetchData = () => {
  loading.value = true
  // 这里是模拟请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 排名样式
const getRankType = (index) => {
  if (index === 0) return 'danger'
  if (index === 1) return 'warning'
  if (index === 2) return 'success'
  return 'info'
}

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

// 重置方法
const handleReset = () => {
  searchForm.merchantIds = []
  handleSearch()
}

// 分页方法
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
  ElMessageBox.confirm('确定要导出当前筛选条件下的数据吗?', '导出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('数据导出成功')
  }).catch(() => {})
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 500)
}

// 格式化金额
const formatAmount = (amount) => {
  return Number(amount).toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化数字
const formatNumber = (num) => {
  return num.toLocaleString('zh-CN')
}
</script>

<style scoped>
.merchant-rank-container {
  padding: 16px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
}

.filter-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
}

.filter-form :deep(.el-form-item__label) {
  padding-right: 8px;
  font-weight: normal;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  gap: 12px;
}

/* 统计卡片样式 - 已移除 */

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
}

.rank-tag {
  min-width: 28px;
  border-radius: 14px;
  font-weight: bold;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.amount-cell {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.time-filter-container {
  display: flex;
  align-items: center;
}
</style> 