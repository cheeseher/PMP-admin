<!-- 系统管理/角色管理 - 管理员角色管理页面 -->
<template>
  <div class="role-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="角色名称：">
            <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" style="width: 168px" clearable />
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
          <span class="table-title">角色列表</span>
          <el-tag type="info" size="small" effect="plain">{{ pagination.total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增角色</el-button>
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
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="roleName" label="角色名称" width="120" />
        <el-table-column prop="roleCode" label="角色编码" width="120" />
        <el-table-column prop="description" label="角色描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="adminCount" label="用户数量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="success" link size="small" @click="handlePermission(scope.row)">分配权限</el-button>
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
  roleName: '',
  status: ''
})

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    id: 1,
    roleName: '超级管理员',
    roleCode: 'SUPER_ADMIN',
    description: '系统超级管理员，拥有所有权限',
    adminCount: 1,
    status: 'enabled',
    createTime: '2025-03-20 08:00:00'
  },
  {
    id: 2,
    roleName: '运营管理员',
    roleCode: 'OPERATION',
    description: '运营相关功能的管理员',
    adminCount: 5,
    status: 'enabled',
    createTime: '2025-03-21 09:15:00'
  },
  {
    id: 3,
    roleName: '财务管理员',
    roleCode: 'FINANCE',
    description: '财务相关功能的管理员',
    adminCount: 3,
    status: 'enabled',
    createTime: '2025-03-22 10:30:00'
  },
  {
    id: 4,
    roleName: '查看角色',
    roleCode: 'VIEW_ONLY',
    description: '只能查看数据，不能操作的角色',
    adminCount: 2,
    status: 'disabled',
    createTime: '2025-03-23 11:45:00'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 4
})

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  ElMessage.success('搜索条件已提交')
}

// 重置搜索条件
const handleReset = () => {
  Object.assign(searchForm, {
    roleName: '',
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

// 添加角色
const handleAdd = () => {
  ElMessageBox.alert('新增角色功能开发中', '提示', {
    confirmButtonText: '确定'
  })
}

// 编辑角色
const handleEdit = (row) => {
  ElMessageBox.alert(`编辑角色：${row.roleName}`, '提示', {
    confirmButtonText: '确定'
  })
}

// 分配权限
const handlePermission = (row) => {
  ElMessageBox.alert(`为角色"${row.roleName}"分配权限`, '提示', {
    confirmButtonText: '确定'
  })
}

// 切换状态
const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  
  ElMessageBox.confirm(
    `确定要${action}角色 "${row.roleName}" 吗？`, 
    '提示', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`已${action}角色 "${row.roleName}"`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 删除角色
const handleDelete = (row) => {
  if (row.adminCount > 0) {
    ElMessage.warning(`角色"${row.roleName}"下还有${row.adminCount}个用户，不能删除`)
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除角色 "${row.roleName}" 吗？此操作不可恢复！`, 
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
    ElMessage.success(`已删除角色 "${row.roleName}"`)
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
.role-list-container {
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