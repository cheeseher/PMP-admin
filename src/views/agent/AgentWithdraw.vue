<template>
  <div class="page-container">
    <!-- 筛选区 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="提现状态：">
            <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 168px">
              <el-option label="待审核" value="pending" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failed" />
            </el-select>
          </el-form-item>
          <el-form-item label="提现单号：">
            <el-input v-model="filterForm.withdrawNo" placeholder="请输入提现单号" style="width: 200px" clearable />
          </el-form-item>
          <el-form-item label="操作时间：">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 320px"
            />
          </el-form-item>
          <div class="filter-buttons">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="table-toolbar">
      <div class="left"></div>
      <div class="right">
        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
        <el-tooltip content="刷新数据">
          <el-button :icon="Refresh" circle plain @click="fetchData" />
        </el-tooltip>
      </div>
    </div>

    <!-- 表格展示 -->
    <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="agentName" label="代理商" width="120" />
      <el-table-column prop="withdrawNo" label="提现订单号" min-width="160" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="beforeBalance" label="提现前余额" width="130" align="right" />
      <el-table-column prop="frozenAmount" label="冻结金额" width="130" align="right" />
      <el-table-column prop="amount" label="提现金额" width="130" align="right">
        <template #default="scope">
          <span class="text-primary" style="font-weight: bold">{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fee" label="手续费" width="100" align="right" />
      <el-table-column prop="afterBalance" label="提现后余额" width="130" align="right" />
      <el-table-column prop="afterFrozen" label="提现后冻结" width="130" align="right" />
      <el-table-column prop="bankName" label="银行名称" min-width="140" />
      <el-table-column prop="realName" label="姓名" width="100" />
      <el-table-column prop="cardNo" label="卡号" min-width="180" />
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      <el-table-column prop="createTime" label="操作时间" width="160" align="center" />
    </el-table>

    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Download, Refresh } from '@element-plus/icons-vue'
import { getAgentWithdrawList } from '@/data/agentWithdrawData.js'
import { ElMessage } from 'element-plus'

// 筛选表单
const filterForm = reactive({
  status: '',
  withdrawNo: '',
  dateRange: []
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 初始化获取数据
onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getAgentWithdrawList({
      ...filterForm,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data
    pagination.total = res.total
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 筛选操作
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

const handleReset = () => {
  filterForm.status = ''
  filterForm.withdrawNo = ''
  filterForm.dateRange = []
  handleSearch()
}

// 分页操作
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchData()
}

// 状态映射
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    success: 'success',
    failed: 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待审核',
    success: '成功',
    failed: '失败'
  }
  return labels[status] || status
}

// 导出操作
const handleExport = () => {
  ElMessage.success('导出数据正在生成中...')
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-toolbar .right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-primary {
  color: var(--el-color-primary);
}

:deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}
</style>
