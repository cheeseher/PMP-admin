<!-- 商户流水页面 - 管理商户流水信息 -->
<template>
  <div class="merchant-flow-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="流水类型：">
            <el-select v-model="searchForm.flowType" placeholder="请选择流水类型" style="width: 168px" clearable>
              <el-option label="支付订单成功" value="payOrderSuccess" />
              <el-option label="用户提现" value="userWithdraw" />
              <el-option label="手动加款" value="manualAdd" />
              <el-option label="手动扣款" value="manualDeduct" />
            </el-select>
          </el-form-item>
          <el-form-item label="单号/系统订单号/商户订单号：">
            <el-input v-model="searchForm.orderNo" placeholder="请输入单号/系统订单号/商户订单号" style="width: 250px" clearable />
          </el-form-item>
          <el-form-item label="开始日期：">
            <el-date-picker
              v-model="searchForm.startDate"
              type="date"
              placeholder="选择开始日期"
              style="width: 165px"
            />
          </el-form-item>
          <el-form-item label="结束日期：">
            <el-date-picker
              v-model="searchForm.endDate"
              type="date"
              placeholder="选择结束日期"
              style="width: 165px"
            />
          </el-form-item>
        </div>
        
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <div class="statistics-info">
      <span>统计日期: {{ statisticsDate }}</span>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
        </div>
        <div class="right">
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
        <el-table-column prop="flowId" label="流水ID" width="100" />
        <el-table-column prop="productName" label="商户名称" min-width="120" />
        <el-table-column prop="flowType" label="流水类型" width="120">
          <template #default="scope">
            <div class="flow-type">
              <span class="dot" :style="{ backgroundColor: getFlowTypeColor(scope.row.flowType) }"></span>
              <span>{{ scope.row.flowType }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="beforeAmount" label="变更前余额" width="120" align="right">
          <template #default="scope">
            {{ formatAmount(scope.row.beforeAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="changeAmount" label="变更金额" width="120" align="right">
          <template #default="scope">
            <span :class="scope.row.changeAmount < 0 ? 'text-red' : 'text-green'">
              {{ formatAmount(scope.row.changeAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="afterAmount" label="变更后余额" width="120" align="right">
          <template #default="scope">
            {{ formatAmount(scope.row.afterAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="交易金额" width="120" align="right">
          <template #default="scope">
            {{ formatAmount(scope.row.fee) }}
          </template>
        </el-table-column>
        <el-table-column prop="productRate" label="商户费率" width="100" align="right">
          <template #default="scope">
            {{ scope.row.productRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="productFee" label="商户手续费" width="120" align="right">
          <template #default="scope">
            {{ formatAmount(scope.row.productFee) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
        <el-table-column prop="orderNo" label="单号/订单号" min-width="180" />
        <el-table-column prop="createTime" label="时间" width="160" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  flowType: '',
  orderNo: '',
  startDate: '',
  endDate: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 统计日期
const statisticsDate = computed(() => {
  if (searchForm.startDate && searchForm.endDate) {
    return `${searchForm.startDate} ~ ${searchForm.endDate}`
  } else {
    const today = new Date().toISOString().split('T')[0]
    return `${today} ~ ${today}`
  }
})

// 获取数据
const fetchData = () => {
  loading.value = true
  
  // 模拟异步请求
  setTimeout(() => {
    // 模拟数据
    const mockData = [
      {
        flowId: '2873469',
        productName: '商户A',
        flowType: '支付订单成功',
        beforeAmount: 5000.90,
        changeAmount: -284.10,
        afterAmount: 5285.00,
        fee: 300.00,
        productRate: 5.30,
        productFee: 15.90,
        remark: '-',
        orderNo: 'AUDIT12025032BvlqUNIF',
        createTime: '2025/03/28 12:23:51'
      },
      {
        flowId: '2872140',
        productName: '商户A',
        flowType: '支付订单成功',
        beforeAmount: 4519.90,
        changeAmount: -481.00,
        afterAmount: 5000.90,
        fee: 500.00,
        productRate: 3.80,
        productFee: 19.00,
        remark: '-',
        orderNo: 'AUDIT12025032BPdwZM',
        createTime: '2025/03/28 11:27:26'
      },
      {
        flowId: '2870020',
        productName: '商户A',
        flowType: '支付订单成功',
        beforeAmount: 4235.80,
        changeAmount: -284.10,
        afterAmount: 4519.90,
        fee: 300.00,
        productRate: 5.30,
        productFee: 15.90,
        remark: '-',
        orderNo: 'AUDIT12025032B2hsdbh',
        createTime: '2025/03/28 09:50:50'
      },
      {
        flowId: '2869388',
        productName: '商户A',
        flowType: '支付订单成功',
        beforeAmount: 4046.40,
        changeAmount: -189.40,
        afterAmount: 4235.80,
        fee: 200.00,
        productRate: 5.30,
        productFee: 10.60,
        remark: '-',
        orderNo: 'AUDIT12025032BoG4WIR',
        createTime: '2025/03/28 09:06:42'
      },
      {
        flowId: '2868446',
        productName: '商户A',
        flowType: '支付订单成功',
        beforeAmount: 3857.00,
        changeAmount: -189.40,
        afterAmount: 4046.40,
        fee: 200.00,
        productRate: 5.30,
        productFee: 10.60,
        remark: '-',
        orderNo: 'AUDIT12025032BG3A7oI',
        createTime: '2025/03/28 07:55:52'
      },
      {
        flowId: '2867713',
        productName: '商户A',
        flowType: '支付订单成功',
        beforeAmount: 3572.90,
        changeAmount: -284.10,
        afterAmount: 3857.00,
        fee: 300.00,
        productRate: 5.30,
        productFee: 15.90,
        remark: '-',
        orderNo: 'AUDIT12025032BkWQ9P',
        createTime: '2025/03/28 06:18:21'
      }
    ]
    
    // 筛选处理
    let filteredData = [...mockData]
    
    if (searchForm.flowType) {
      filteredData = filteredData.filter(item => 
        item.flowType === searchForm.flowType)
    }
    
    if (searchForm.orderNo) {
      filteredData = filteredData.filter(item => 
        item.orderNo.toLowerCase().includes(searchForm.orderNo.toLowerCase()))
    }
    
    total.value = filteredData.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    
    tableData.value = filteredData.slice(start, end)
    loading.value = false
  }, 300)
}

// 格式化金额
const formatAmount = (amount) => {
  return amount?.toFixed(2) || '0.00'
}

// 获取流水类型颜色
const getFlowTypeColor = (type) => {
  switch(type) {
    case '支付订单成功': return '#67C23A'
    case '用户提现': return '#F56C6C'
    case '手动加款': return '#409EFF'
    case '手动扣款': return '#E6A23C'
    default: return '#909399'
  }
}

// 搜索与重置
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
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
  ElMessage.success('商户流水数据导出成功')
}

// 页面加载时获取数据
onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
  searchForm.startDate = today
  searchForm.endDate = today
  fetchData()
})
</script>

<style scoped>
.merchant-flow-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.el-card {
  overflow-x: auto;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
  width: 100%;
}

.filter-row .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.statistics-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}

.flow-type {
  display: flex;
  align-items: center;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.text-red {
  color: #F56C6C;
}

.text-green {
  color: #67C23A;
}
</style> 