<!-- 系统管理/菜单管理 - 管理系统菜单页面 -->
<template>
  <div class="menu-list-container">
    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <span class="table-title">菜单列表</span>
          <el-tag type="info" size="small" effect="plain">共 {{ tableData.length }} 条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增菜单</el-button>
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
        <el-table-column prop="menuName" label="菜单名称" width="150" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="scope">
            <el-icon v-if="scope.row.icon"><component :is="scope.row.icon" /></el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'directory'" type="primary" size="small">目录</el-tag>
            <el-tag v-else-if="scope.row.type === 'menu'" type="success" size="small">菜单</el-tag>
            <el-tag v-else-if="scope.row.type === 'button'" type="warning" size="small">按钮</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" width="150" />
        <el-table-column prop="component" label="组件路径" width="200" show-overflow-tooltip />
        <el-table-column prop="permission" label="权限标识" width="150" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="visible" label="显示状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.visible ? 'success' : 'info'" size="small">
              {{ scope.row.visible ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleAdd(scope.row)">添加子菜单</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { 
  Refresh, Plus, Setting, Document, Menu as MenuIcon, 
  HomeFilled, UserFilled, Lock, Ticket, List, ChatDotRound 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    id: 1,
    menuName: '系统管理',
    icon: 'Setting',
    type: 'directory',
    path: '/system',
    component: 'Layout',
    permission: 'system',
    sort: 1,
    visible: true,
    status: 'enabled',
    children: [
      {
        id: 11,
        menuName: '管理员管理',
        icon: 'UserFilled',
        type: 'menu',
        path: '/system/admin',
        component: 'system/AdminList',
        permission: 'system:admin',
        sort: 1,
        visible: true,
        status: 'enabled',
        children: [
          {
            id: 111,
            menuName: '查看管理员',
            icon: '',
            type: 'button',
            path: '',
            component: '',
            permission: 'system:admin:view',
            sort: 1,
            visible: true,
            status: 'enabled'
          },
          {
            id: 112,
            menuName: '新增管理员',
            icon: '',
            type: 'button',
            path: '',
            component: '',
            permission: 'system:admin:add',
            sort: 2,
            visible: true,
            status: 'enabled'
          }
        ]
      },
      {
        id: 12,
        menuName: '角色管理',
        icon: 'Lock',
        type: 'menu',
        path: '/system/role',
        component: 'system/RoleList',
        permission: 'system:role',
        sort: 2,
        visible: true,
        status: 'enabled'
      },
      {
        id: 13,
        menuName: '权限管理',
        icon: 'List',
        type: 'menu',
        path: '/system/permission',
        component: 'system/PermissionList',
        permission: 'system:permission',
        sort: 3,
        visible: true,
        status: 'enabled'
      },
      {
        id: 14,
        menuName: '菜单管理',
        icon: 'MenuIcon',
        type: 'menu',
        path: '/system/menu',
        component: 'system/MenuList',
        permission: 'system:menu',
        sort: 4,
        visible: true,
        status: 'enabled'
      }
    ]
  },
  {
    id: 2,
    menuName: '商户管理',
    icon: 'ShoppingBag',
    type: 'directory',
    path: '/product',
    component: 'Layout',
    permission: 'product',
    sort: 2,
    visible: true,
    status: 'enabled'
  },
  {
    id: 3,
    menuName: '订单管理',
    icon: 'Ticket',
    type: 'directory',
    path: '/order',
    component: 'Layout',
    permission: 'order',
    sort: 3,
    visible: true,
    status: 'enabled'
  }
])

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 500)
}

// 添加菜单
const handleAdd = (row) => {
  if (row) {
    ElMessageBox.alert(`新增"${row.menuName}"的子菜单`, '提示', {
      confirmButtonText: '确定'
    })
  } else {
    ElMessageBox.alert('新增顶级菜单', '提示', {
      confirmButtonText: '确定'
    })
  }
}

// 编辑菜单
const handleEdit = (row) => {
  ElMessageBox.alert(`编辑菜单：${row.menuName}`, '提示', {
    confirmButtonText: '确定'
  })
}

// 删除菜单
const handleDelete = (row) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning(`菜单"${row.menuName}"下还有子菜单，不能删除`)
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除菜单 "${row.menuName}" 吗？此操作不可恢复！`, 
    '警告', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    ElMessage.success(`已删除菜单 "${row.menuName}"`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}
</script>

<style scoped>
.menu-list-container {
  padding: 16px;
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
</style> 