<!-- 系统管理/管理员业务日志 - 记录管理员业务操作 -->
<template>
  <div class="business-log-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" label-position="left" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="订单号：">
            <el-input v-model="searchForm.businessObject" placeholder="请输入订单号" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="操作IP：">
            <el-input v-model="searchForm.ip" placeholder="请输入操作IP" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="日志内容：">
            <el-input v-model="searchForm.description" placeholder="请输入日志内容" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="日期范围：">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              :shortcuts="dateShortcuts"
              style="width: 280px"
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
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">业务日志列表</span>
          <el-tag type="info" size="small" effect="plain">{{ pagination.total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button :icon="Download" plain @click="handleExport">导出日志</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="refreshData" />
          </el-tooltip>
        </div>
      </div>
      
      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="序号" width="80" />
        <el-table-column prop="operationUser" label="操作人" width="120">
          <template #default="{ row }">
            <el-tooltip :content="row.operationRole" placement="top">
              <span>{{ row.operationUser }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="businessObject" label="操作的订单ID" width="180" />
        <el-table-column prop="operationIp" label="操作IP" width="160">
          <template #default="{ row }">
            {{ row.operationIp || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="日志" min-width="300" show-overflow-tooltip />
        <el-table-column prop="operationTime" label="操作时间" width="180" sortable />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, Delete, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  businessObject: '',
  ip: '',
  description: '',
  dateRange: []
})

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    id: 1,
    operationUser: 'admin',
    operationRole: '超级管理员',
    businessObject: 'P20250304173132398356047',
    operationIp: '192.168.1.1',
    description: 'admin后台手动撤销了该订单，交易号：P20250304173132398356047 金额:100.00',
    operationTime: '2025-03-04 17:31:32'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 1
})

// 业务类型映射
const getBusinessTypeTag = (type) => {
  const map = {
    merchant_recharge: 'success',
    merchant_withdraw: 'warning',
    order_supplement: 'info',
    rate_adjust: 'primary',
    merchant_register: 'success',
    balance_adjust: 'warning'
  }
  return map[type] || 'info'
}

const getBusinessTypeText = (type) => {
  const map = {
    merchant_recharge: '商户充值',
    merchant_withdraw: '商户提现',
    order_supplement: '订单补单',
    rate_adjust: '费率调整',
    merchant_register: '商户注册',
    balance_adjust: '余额调整'
  }
  return map[type] || type
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  ElMessage.success('搜索条件已提交')
}

// 重置搜索条件
const handleReset = () => {
  Object.assign(searchForm, {
    businessObject: '',
    ip: '',
    description: '',
    dateRange: []
  })
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 500)
}

// 导出日志
const handleExport = () => {
  ElMessage.success('日志导出中，请稍后...')
}

// 查看详情
const handleView = (row) => {
  ElMessageBox.alert(
    `<strong>操作ID：</strong>${row.id}<br>
    <strong>业务模块：</strong>${row.businessModule}<br>
    <strong>业务类型：</strong>${getBusinessTypeText(row.businessType)}<br>
    <strong>业务对象：</strong>${row.businessObject}<br>
    <strong>业务描述：</strong>${row.description}<br>
    <strong>操作人：</strong>${row.operationUser}<br>
    <strong>操作角色：</strong>${row.operationRole}<br>
    <strong>操作前数据：</strong>${row.beforeValue}<br>
    <strong>操作后数据：</strong>${row.afterValue}<br>
    <strong>操作状态：</strong>${row.status === 'success' ? '成功' : '失败'}<br>
    <strong>操作时间：</strong>${row.operationTime}<br>`, 
    '业务日志详情', 
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
}

// 分页事件处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  // 这里应该调用获取数据的方法
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  // 这里应该调用获取数据的方法
}
</script>

<style scoped>
.business-log-container {
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

.table-toolbar .right .el-button {
  margin-left: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.ip-location {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}
</style> 