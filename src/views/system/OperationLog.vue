<!-- 系统管理/管理员操作日志 - 记录管理员操作行为 -->
<template>
  <div class="operation-log-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="操作者：">
            <el-input v-model="searchForm.operator" placeholder="请输入操作者" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="操作类型：">
            <el-select v-model="searchForm.operationType" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部类型" value="" />
              <el-option label="登录" value="login" />
              <el-option label="新增" value="add" />
              <el-option label="修改" value="edit" />
              <el-option label="删除" value="delete" />
              <el-option label="导出" value="export" />
              <el-option label="导入" value="import" />
              <el-option label="审核" value="audit" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作状态：">
            <el-select v-model="searchForm.status" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="fail" />
            </el-select>
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
          <el-button type="danger" :icon="Delete" @click="handleClear">清空日志</el-button>
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
        <el-table-column prop="operationModule" label="操作模块" width="120" />
        <el-table-column prop="operationType" label="操作类型" width="100">
          <template #default="scope">
            <el-tag 
              :type="getOperationTypeTag(scope.row.operationType)" 
              size="small"
            >
              {{ getOperationTypeText(scope.row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="requestMethod" label="请求方式" width="100" />
        <el-table-column prop="operationUser" label="操作人" width="120" />
        <el-table-column prop="operationRole" label="操作角色" width="120" />
        <el-table-column prop="operationIp" label="操作IP" width="120" />
        <el-table-column prop="status" label="操作状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="操作时间" width="160" />
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleView(scope.row)">详情</el-button>
          </template>
        </el-table-column>
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
  operator: '',
  operationType: '',
  status: '',
  dateRange: []
})

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    id: 1,
    operationModule: '系统管理',
    operationType: 'login',
    description: '管理员登录系统',
    requestMethod: 'POST',
    operationUser: 'admin',
    operationRole: '超级管理员',
    operationIp: '192.168.1.1',
    status: 'success',
    operationTime: '2025-03-24 10:00:00'
  },
  {
    id: 2,
    operationModule: '管理员管理',
    operationType: 'add',
    description: '新增管理员：operator',
    requestMethod: 'POST',
    operationUser: 'admin',
    operationRole: '超级管理员',
    operationIp: '192.168.1.1',
    status: 'success',
    operationTime: '2025-03-24 10:15:30'
  },
  {
    id: 3,
    operationModule: '角色管理',
    operationType: 'edit',
    description: '修改角色：运营管理员',
    requestMethod: 'PUT',
    operationUser: 'admin',
    operationRole: '超级管理员',
    operationIp: '192.168.1.1',
    status: 'success',
    operationTime: '2025-03-24 10:30:15'
  },
  {
    id: 4,
    operationModule: '菜单管理',
    operationType: 'delete',
    description: '删除菜单：测试菜单',
    requestMethod: 'DELETE',
    operationUser: 'admin',
    operationRole: '超级管理员',
    operationIp: '192.168.1.1',
    status: 'success',
    operationTime: '2025-03-24 11:05:20'
  },
  {
    id: 5,
    operationModule: '商户管理',
    operationType: 'export',
    description: '导出商户数据',
    requestMethod: 'GET',
    operationUser: 'operator',
    operationRole: '运营管理员',
    operationIp: '192.168.1.2',
    status: 'fail',
    operationTime: '2025-03-24 14:20:45'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 125
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
    operator: '',
    operationType: '',
    status: '',
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

// 清空日志
const handleClear = () => {
  ElMessageBox.confirm(
    '确定要清空所有操作日志吗？此操作不可恢复！', 
    '警告', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    ElMessage.success('操作日志已清空')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 查看详情
const handleView = (row) => {
  ElMessageBox.alert(
    `<strong>操作ID：</strong>${row.id}<br>
    <strong>操作模块：</strong>${row.operationModule}<br>
    <strong>操作类型：</strong>${getOperationTypeText(row.operationType)}<br>
    <strong>操作描述：</strong>${row.description}<br>
    <strong>请求方式：</strong>${row.requestMethod}<br>
    <strong>操作人：</strong>${row.operationUser}<br>
    <strong>操作角色：</strong>${row.operationRole}<br>
    <strong>操作IP：</strong>${row.operationIp}<br>
    <strong>操作状态：</strong>${row.status === 'success' ? '成功' : '失败'}<br>
    <strong>操作时间：</strong>${row.operationTime}<br>`, 
    '操作日志详情', 
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