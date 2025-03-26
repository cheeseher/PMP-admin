<!-- 系统管理/管理员操作日志 - 记录管理员操作行为 -->
<template>
  <div class="operation-log-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="操作IP：">
            <el-input v-model="searchForm.operationIp" placeholder="请输入操作IP" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="URL：">
            <el-input v-model="searchForm.requestUrl" placeholder="请输入URL" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="参数：">
            <el-input v-model="searchForm.requestParams" placeholder="请输入参数" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="操作日期：">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 360px"
            />
          </el-form-item>
        </div>
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">操作日志列表</span>
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
        <el-table-column prop="operationUser" label="操作人" width="120" />
        <el-table-column prop="requestMethod" label="方法" width="100" />
        <el-table-column prop="requestUrl" label="URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="operationIp" label="操作IP" width="120" />
        <el-table-column prop="requestParams" label="参数" min-width="200" show-overflow-tooltip />
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
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  operationIp: '',
  requestUrl: '',
  requestParams: '',
  dateRange: []
})

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    id: 1,
    operationUser: 'admin',
    requestMethod: 'POST',
    requestUrl: 'admin/merchant_pay_orders/list',
    operationIp: '192.168.1.1',
    requestParams: '{"page":"1","limit":"30","_token":"0r7DH3b387JoQh3XMPhoxbwgFLVt4HnrdgY9FnkZ"}',
    operationTime: '2025-03-24 10:00:00',
    operationModule: '商户支付订单管理',
    operationType: 'query',
    description: '查询商户支付订单列表',
    operationRole: '超级管理员',
    status: 'success'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 1
})

// 操作类型映射
const getOperationTypeTag = (type) => {
  const map = {
    login: 'info',
    add: 'success',
    edit: 'warning',
    delete: 'danger',
    export: 'info',
    import: 'success',
    audit: 'warning'
  }
  return map[type] || 'info'
}

const getOperationTypeText = (type) => {
  const map = {
    login: '登录',
    add: '新增',
    edit: '修改',
    delete: '删除',
    export: '导出',
    import: '导入',
    audit: '审核'
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
    operationIp: '',
    requestUrl: '',
    requestParams: '',
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
.operation-log-container {
  padding: 16px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-direction: column;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.filter-row .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
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
</style> 