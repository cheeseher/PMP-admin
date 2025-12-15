<!-- 系统管理/角色管理 - 管理员角色管理页面 -->
<template>
  <div class="role-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" label-position="left" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="角色ID：">
            <el-input v-model="searchForm.id" placeholder="请输入角色ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="角色名称：">
            <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" style="width: 168px" clearable />
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
          <span class="table-title">角色列表</span>
          <el-tag type="info" size="small" effect="plain">{{ pagination.total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增角色</el-button>
          <el-button type="danger" :icon="Delete" plain :disabled="!selectedRows.length" @click="handleBatchDelete">批量删除</el-button>
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
        <el-table-column prop="id" label="角色ID" width="80" />
        <el-table-column prop="roleName" label="角色名称" width="120" />
        <el-table-column prop="roleCode" label="标识符" width="120" />
        <el-table-column label="权限" min-width="400">
          <template #default="{ row }">
            <el-space wrap>
              <template v-for="permission in getPermissionLabels(row.permissions)" :key="permission">
                <el-tag size="small" effect="plain">{{ permission }}</el-tag>
              </template>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)" style="font-size: 14px;">编辑</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)" style="font-size: 14px;">删除</el-button>
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

    <!-- 角色表单对话框（新增/编辑） -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="标识符" prop="roleCode">
          <el-input v-model="roleForm.roleCode" placeholder="请输入角色标识符" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-divider content-position="left">权限设置</el-divider>
        <el-form-item class="permission-tree-container">
          <el-tree
            ref="permissionTreeRef"
            :data="permissionsData"
            show-checkbox
            node-key="id"
            :default-checked-keys="roleForm.permissions"
            :props="{ label: 'label', children: 'children' }"
            :check-strictly="false"
            :default-expand-all="true"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRoleForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { Search, Refresh, Plus, Delete, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  id: '',
  roleName: ''
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
    createTime: '2025-03-20 08:00:00',
    permissions: [1, 11, 12, 13, 2, 21, 22, 3, 31, 32, 4, 41, 42, 5, 51, 52, 6, 61, 62, 7, 71, 72, 8, 81, 82, 9, 91, 92]
  },
  {
    id: 2,
    roleName: '运营管理员',
    roleCode: 'OPERATION',
    description: '运营相关功能的管理员',
    adminCount: 5,
    status: 'enabled',
    createTime: '2025-03-21 09:15:00',
    permissions: [1, 11, 12, 2, 21, 22, 3, 31, 32]
  },
  {
    id: 3,
    roleName: '财务管理员',
    roleCode: 'FINANCE',
    description: '财务相关功能的管理员',
    adminCount: 3,
    status: 'enabled',
    createTime: '2025-03-22 10:30:00',
    permissions: [4, 41, 42, 5, 51, 52]
  },
  {
    id: 4,
    roleName: '查看角色',
    roleCode: 'VIEW_ONLY',
    description: '只能查看数据，不能操作的角色',
    adminCount: 2,
    status: 'disabled',
    createTime: '2025-03-23 11:45:00',
    permissions: [9, 91]
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 4
})

// 多选相关
const selectedRows = ref([])

// 多选变化事件
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
    id: '',
    roleName: ''
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

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const roleFormRef = ref(null)
const permissionTreeRef = ref(null)

// 表单数据
const roleForm = reactive({
  id: '',
  roleName: '',
  roleCode: '',
  description: '',
  permissions: []
})

// 表单验证规则
const roleFormRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  roleCode: [
    { required: true, message: '请输入角色标识符', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '标识符只能包含大写字母和下划线', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

// 权限树数据
const permissionsData = [
  {
    id: 1,
    label: '仪表板'
  },
  {
    id: 2,
    label: '数据统计',
    children: [
      { id: 21, label: '产品跑量统计' },
      { id: 22, label: '上游渠道统计' },
      { id: 23, label: '支付通道统计' },
      { id: 24, label: '商户支付排行' },
      { id: 25, label: '平台分润统计' },
      { id: 26, label: '商户收款统计' },
      { id: 27, label: '商户出款统计' },
      { id: 28, label: '商户余额快照' }
    ]
  },
  {
    id: 3,
    label: '订单管理',
    children: [
      { id: 31, label: '商户充值列表' },
      { id: 32, label: '商户订单管理' },
      { id: 33, label: '商户提现审核' }
    ]
  },
  {
    id: 4,
    label: '供应商管理',
    children: [
      { id: 41, label: '供应商列表' },
      { id: 42, label: '供应商通道管理' }
    ]
  },
  {
    id: 5,
    label: '商户管理',
    children: [
      { id: 51, label: '商户列表' },
      { id: 52, label: '商户产品列表' }
    ]
  },
  {
    id: 6,
    label: '支付配置',
    children: [
      { id: 61, label: '支付类型管理' },
      { id: 62, label: '支付产品管理' }
    ]
  },
  {
    id: 7,
    label: '系统管理',
    children: [
      { id: 71, label: '管理员管理' },
      { id: 72, label: '角色管理' },
      { id: 73, label: '权限管理' },
      { id: 74, label: '菜单管理' },
      { id: 75, label: '管理员操作日志' },
      { id: 76, label: '管理员业务日志' }
    ]
  }
]

// 添加角色
const handleAdd = () => {
  dialogType.value = 'add'
  resetRoleForm()
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (row) => {
  dialogType.value = 'edit'
  resetRoleForm()
  nextTick(() => {
    // 填充表单数据
    Object.assign(roleForm, {
      id: row.id,
      roleName: row.roleName,
      roleCode: row.roleCode,
      description: row.description,
      permissions: row.permissions || []
    })
    dialogVisible.value = true
  })
}

// 重置表单数据
const resetRoleForm = () => {
  Object.assign(roleForm, {
    id: '',
    roleName: '',
    roleCode: '',
    description: '',
    permissions: []
  })
  if (roleFormRef.value) {
    roleFormRef.value.resetFields()
  }
}

// 提交表单
const submitRoleForm = () => {
  if (roleFormRef.value) {
    roleFormRef.value.validate((valid) => {
      if (valid) {
        // 获取选中的权限
        const permissions = permissionTreeRef.value.getCheckedKeys()
        // 也要包含半选中的节点（父节点）
        const halfPermissions = permissionTreeRef.value.getHalfCheckedKeys()
        roleForm.permissions = [...permissions, ...halfPermissions]

        if (dialogType.value === 'add') {
          // 模拟新增API调用
          const newId = Math.max(...tableData.value.map(item => item.id)) + 1
          const newRole = {
            id: newId,
            roleName: roleForm.roleName,
            roleCode: roleForm.roleCode,
            description: roleForm.description,
            adminCount: 0,
            status: 'enabled',
            createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            permissions: roleForm.permissions
          }
          tableData.value.push(newRole)
          pagination.total += 1
          ElMessage.success('新增角色成功')
        } else {
          // 模拟编辑API调用
          const index = tableData.value.findIndex(item => item.id === roleForm.id)
          if (index !== -1) {
            const updatedRole = {
              ...tableData.value[index],
              roleName: roleForm.roleName,
              roleCode: roleForm.roleCode,
              description: roleForm.description,
              permissions: roleForm.permissions
            }
            tableData.value.splice(index, 1, updatedRole)
            ElMessage.success('更新角色成功')
          }
        }
        dialogVisible.value = false
      } else {
        return false
      }
    })
  }
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

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一个角色')
    return
  }
  
  // 检查是否有关联用户的角色
  const hasUsers = selectedRows.value.some(row => row.adminCount > 0)
  if (hasUsers) {
    ElMessage.warning('选中的角色中有关联用户的角色，不能批量删除')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个角色吗？此操作不可恢复！`, 
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
    ElMessage.success(`已删除 ${selectedRows.value.length} 个角色`)
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

// 获取权限标签
const getPermissionLabels = (permissionIds) => {
  const labels = []
  const findLabel = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) {
        labels.push(node.label)
        return true
      }
      if (node.children && findLabel(node.children, id)) {
        return true
      }
    }
    return false
  }

  permissionIds.forEach(id => {
    findLabel(permissionsData, id)
  })

  return labels
}
</script>

<style scoped>
.role-list-container {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.permission-tree-container {
  margin: 0;
  padding: 0 20px;
}

.permission-tree-container .el-tree {
  margin-top: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  height: 400px;
  overflow-y: auto;
}
</style>