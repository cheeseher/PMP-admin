<!-- 系统管理/权限管理 - 管理系统权限页面 -->
<template>
  <div class="permission-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="权限名称：">
            <el-input v-model="searchForm.permissionName" placeholder="请输入权限名称" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="权限编码：">
            <el-input v-model="searchForm.permissionCode" placeholder="请输入权限编码" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="类型：">
            <el-select v-model="searchForm.type" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部类型" value="all" />
              <el-option label="菜单" value="menu" />
              <el-option label="按钮" value="button" />
              <el-option label="API" value="api" />
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
          <span class="table-title">权限列表</span>
          <el-tag type="info" size="small" effect="plain">{{ pagination.total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增权限</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="refreshData" />
          </el-tooltip>
        </div>
      </div>
      
      <el-table
        :data="tableData"
        border
        stripe
        row-key="id"
        :tree-props="{ children: 'children' }"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="permissionName" label="权限名称" width="150" />
        <el-table-column prop="permissionCode" label="权限编码" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'menu'" type="success" size="small">菜单</el-tag>
            <el-tag v-else-if="scope.row.type === 'button'" type="warning" size="small">按钮</el-tag>
            <el-tag v-else-if="scope.row.type === 'api'" type="info" size="small">API</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" width="150" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="scope">
            <el-icon v-if="scope.row.icon"><component :is="scope.row.icon" /></el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleAdd(scope.row)">添加子权限</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">编辑</el-button>
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
import { Search, Refresh, Plus, Setting, Document, Menu } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  permissionName: '',
  permissionCode: '',
  type: ''
})

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    id: 1,
    permissionName: '系统管理',
    permissionCode: 'system',
    type: 'menu',
    path: '/system',
    icon: 'Setting',
    sort: 1,
    description: '系统管理模块',
    children: [
      {
        id: 11,
        permissionName: '管理员管理',
        permissionCode: 'system:admin',
        type: 'menu',
        path: '/system/admin',
        icon: 'User',
        sort: 1,
        description: '管理员管理',
        children: [
          {
            id: 111,
            permissionName: '查看',
            permissionCode: 'system:admin:view',
            type: 'button',
            path: '',
            icon: '',
            sort: 1,
            description: '查看管理员列表'
          },
          {
            id: 112,
            permissionName: '新增',
            permissionCode: 'system:admin:add',
            type: 'button',
            path: '',
            icon: '',
            sort: 2,
            description: '新增管理员'
          }
        ]
      },
      {
        id: 12,
        permissionName: '角色管理',
        permissionCode: 'system:role',
        type: 'menu',
        path: '/system/role',
        icon: 'UserFilled',
        sort: 2,
        description: '角色管理'
      }
    ]
  },
  {
    id: 2,
    permissionName: '商户管理',
    permissionCode: 'product',
    type: 'menu',
    path: '/product',
    icon: 'ShoppingBag',
    sort: 2,
    description: '商户管理模块'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 10
})

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  ElMessage.success('搜索条件已提交')
}

// 重置搜索条件
const handleReset = () => {
  Object.assign(searchForm, {
    permissionName: '',
    permissionCode: '',
    type: ''
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

// 添加权限
const handleAdd = (row) => {
  if (row) {
    ElMessageBox.alert(`新增"${row.permissionName}"的子权限`, '提示', {
      confirmButtonText: '确定'
    })
  } else {
    ElMessageBox.alert('新增顶级权限', '提示', {
      confirmButtonText: '确定'
    })
  }
}

// 编辑权限
const handleEdit = (row) => {
  ElMessageBox.alert(`编辑权限：${row.permissionName}`, '提示', {
    confirmButtonText: '确定'
  })
}

// 删除权限
const handleDelete = (row) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning(`权限"${row.permissionName}"下还有子权限，不能删除`)
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除权限 "${row.permissionName}" 吗？此操作不可恢复！`, 
    '警告', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    ElMessage.success(`已删除权限 "${row.permissionName}"`)
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
.permission-list-container {
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