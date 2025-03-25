<!-- 系统管理/管理员管理 - 管理员账号管理页面 -->
<template>
  <div class="admin-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="管理员账号：">
            <el-input v-model="searchForm.username" placeholder="请输入管理员账号" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="姓名：">
            <el-input v-model="searchForm.realName" placeholder="请输入姓名" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="手机号：">
            <el-input v-model="searchForm.mobile" placeholder="请输入手机号" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="状态：">
            <el-select v-model="searchForm.status" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部状态" value="all" />
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
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
          <span class="table-title">管理员列表</span>
          <el-tag type="info" size="small" effect="plain">{{ pagination.total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增管理员</el-button>
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
        <el-table-column prop="id" label="ID" min-width="60" />
        <el-table-column prop="username" label="管理员账号" min-width="120" />
        <el-table-column prop="realName" label="姓名" min-width="100" />
        <el-table-column prop="roleName" label="角色" min-width="100" />
        <el-table-column prop="mobile" label="手机号" min-width="120" />
        <el-table-column prop="lastLoginTime" label="最后登录时间" min-width="160" />
        <el-table-column prop="lastLoginIp" label="最后登录IP" min-width="120" />
        <el-table-column prop="status" label="状态" min-width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" min-width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              :type="scope.row.status === 'enabled' ? 'danger' : 'success'" 
              link 
              size="small" 
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">删除</el-button>
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
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  username: '',
  realName: '',
  mobile: '',
  status: ''
})

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    roleName: '超级管理员',
    mobile: '13800138000',
    lastLoginTime: '2025-03-24 10:00:00',
    lastLoginIp: '192.168.1.1',
    status: 'enabled',
    createTime: '2025-03-20 08:00:00'
  },
  {
    id: 2,
    username: 'operator',
    realName: '运营人员',
    roleName: '运营管理员',
    mobile: '13900139000',
    lastLoginTime: '2025-03-23 16:30:00',
    lastLoginIp: '192.168.1.2',
    status: 'enabled',
    createTime: '2025-03-21 09:15:00'
  },
  {
    id: 3,
    username: 'finance',
    realName: '财务人员',
    roleName: '财务管理员',
    mobile: '13700137000',
    lastLoginTime: '2025-03-22 14:20:00',
    lastLoginIp: '192.168.1.3',
    status: 'disabled',
    createTime: '2025-03-22 10:30:00'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 3
})

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  ElMessage.success('搜索条件已提交')
}

// 重置搜索条件
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    realName: '',
    mobile: '',
    status: ''
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

// 添加管理员
const handleAdd = () => {
  ElMessageBox.alert('新增管理员功能开发中', '提示', {
    confirmButtonText: '确定'
  })
}

// 编辑管理员
const handleEdit = (row) => {
  ElMessageBox.alert(`编辑管理员：${row.username}`, '提示', {
    confirmButtonText: '确定'
  })
}

// 切换状态
const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  
  ElMessageBox.confirm(
    `确定要${action}管理员 "${row.username}" 吗？`, 
    '提示', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`已${action}管理员 "${row.username}"`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 删除管理员
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除管理员 "${row.username}" 吗？此操作不可恢复！`, 
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
    ElMessage.success(`已删除管理员 "${row.username}"`)
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
.admin-list-container {
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