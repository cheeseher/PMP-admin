<!-- 系统管理/管理员操作日志 - 操作日志管理页面 -->
<template>
  <div class="operation-log-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="操作人：">
            <el-input v-model="searchForm.operatorName" placeholder="请输入操作人" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="操作方法：">
            <el-input v-model="searchForm.method" placeholder="请输入操作方法" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="操作IP：">
            <el-input v-model="searchForm.ip" placeholder="请输入操作IP" style="width: 168px" clearable />
          </el-form-item>
        </div>
        <div class="filter-row">
          <el-form-item label="操作时间：">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              :shortcuts="dateShortcuts"
              style="width: 350px"
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
          <el-button plain :icon="Delete" type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">批量删除</el-button>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="id" label="日志ID" width="80" />
        <el-table-column prop="operatorName" label="操作人" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tooltip :content="row.operatorId ? `ID: ${row.operatorId}` : ''" placement="top" :disabled="!row.operatorId">
              <span>{{ row.operatorName }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="方法" min-width="100" show-overflow-tooltip />
        <el-table-column prop="url" label="URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="操作IP" min-width="130">
          <template #default="{ row }">
            {{ row.ip }}
            <span v-if="row.location" class="ip-location">({{ row.location }})</span>
          </template>
        </el-table-column>
        <el-table-column prop="params" label="参数" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button link type="primary" @click="showParamsDetail(row)" v-if="row.params">查看详情</el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="操作时间" min-width="180" sortable />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 参数详情对话框 -->
    <el-dialog
      v-model="paramsDialogVisible"
      title="请求参数详情"
      width="600px"
    >
      <div class="params-dialog-content">
        <pre>{{ currentParams }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  operatorName: '',
  method: '',
  ip: '',
  timeRange: []
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 加载状态
const loading = ref(false)

// 表格多选数据
const selectedRows = ref([])

// 表格数据
const tableData = ref([
  {
    id: 1,
    operatorId: 1,
    operatorName: '系统管理员',
    method: 'POST',
    url: '/api/system/user/add',
    ip: '192.168.1.1',
    location: '内网IP',
    params: JSON.stringify({
      username: 'newadmin',
      realName: '新管理员',
      roles: ['operator']
    }, null, 2),
    operationTime: '2024-03-20 08:00:00'
  },
  {
    id: 2,
    operatorId: 1,
    operatorName: '系统管理员',
    method: 'PUT',
    url: '/api/system/role/update',
    ip: '192.168.1.1',
    location: '内网IP',
    params: JSON.stringify({
      id: 2,
      roleName: '运营管理员',
      permissions: [1, 2, 3, 4]
    }, null, 2),
    operationTime: '2024-03-20 09:15:00'
  },
  {
    id: 3,
    operatorId: 2,
    operatorName: '运营管理员',
    method: 'GET',
    url: '/api/order/list',
    ip: '203.0.113.1',
    location: '北京市',
    params: null,
    operationTime: '2024-03-20 10:30:00'
  },
  {
    id: 4,
    operatorId: 3,
    operatorName: '财务管理员',
    method: 'POST',
    url: '/api/finance/withdraw/approve',
    ip: '203.0.113.2',
    location: '上海市',
    params: JSON.stringify({
      id: 123,
      status: 'approved',
      remark: '审核通过'
    }, null, 2),
    operationTime: '2024-03-21 11:45:00'
  },
  {
    id: 5,
    operatorId: 1,
    operatorName: '系统管理员',
    method: 'DELETE',
    url: '/api/system/user/delete/5',
    ip: '192.168.1.1',
    location: '内网IP',
    params: null,
    operationTime: '2024-03-22 14:20:00'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 5
})

// 参数详情对话框
const paramsDialogVisible = ref(false)
const currentParams = ref('')

// 显示参数详情
const showParamsDetail = (row) => {
  try {
    // 尝试美化JSON格式
    currentParams.value = JSON.stringify(JSON.parse(row.params), null, 2)
  } catch (e) {
    // 如果解析失败，直接显示原始内容
    currentParams.value = row.params
  }
  paramsDialogVisible.value = true
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  ElMessage.success('搜索条件已提交')
}

// 重置搜索条件
const handleReset = () => {
  Object.assign(searchForm, {
    operatorName: '',
    method: '',
    ip: '',
    timeRange: []
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

// 删除操作日志
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除ID为 ${row.id} 的操作日志吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    pagination.total -= 1
    ElMessage.success('已删除操作日志')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 批量删除操作日志
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条操作日志')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 条操作日志吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    const selectedIds = selectedRows.value.map(row => row.id)
    tableData.value = tableData.value.filter(item => !selectedIds.includes(item.id))
    pagination.total -= selectedRows.value.length
    ElMessage.success(`已删除 ${selectedRows.value.length} 条操作日志`)
    selectedRows.value = []
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
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
  margin-bottom: 16px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-row .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
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

.ip-location {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}

.params-dialog-content {
  max-height: 400px;
  overflow-y: auto;
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
}

.params-dialog-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 