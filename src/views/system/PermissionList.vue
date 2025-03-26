<!-- 系统管理/权限管理 - 权限管理页面 -->
<template>
  <div class="permission-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="权限ID：">
            <el-input v-model="searchForm.id" placeholder="请输入权限ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="权限名称：">
            <el-input v-model="searchForm.name" placeholder="请输入权限名称" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="权限类型：">
            <el-select v-model="searchForm.type" placeholder="请选择权限类型" style="width: 168px" clearable>
              <el-option label="菜单权限" value="menu" />
              <el-option label="按钮权限" value="button" />
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
        <el-table-column prop="id" label="权限ID" width="80" />
        <el-table-column prop="name" label="权限名称" min-width="120" />
        <el-table-column prop="code" label="权限标识符" min-width="180" />
        <el-table-column prop="type" label="权限类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'menu' ? 'success' : 'warning'" size="small">
              {{ row.type === 'menu' ? '菜单权限' : '按钮权限' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="menuName" label="所属菜单" min-width="120">
          <template #default="{ row }">
            {{ row.type === 'button' ? row.menuName : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              type="danger" 
              link 
              :icon="Delete" 
              @click="handleDelete(scope.row)"
              :disabled="scope.row.isSystem"
            >删除</el-button>
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

    <!-- 权限表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增权限' : '编辑权限'"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限标识符" prop="code">
          <el-input 
            v-model="permissionForm.code" 
            placeholder="请输入权限标识符"
            :disabled="permissionForm.isSystem"
          />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="permissionForm.type" :disabled="dialogType === 'edit'">
            <el-radio label="menu">菜单权限</el-radio>
            <el-radio label="button">按钮权限</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item 
          label="所属菜单" 
          prop="menuId"
          v-if="permissionForm.type === 'button'"
        >
          <el-select 
            v-model="permissionForm.menuId" 
            placeholder="请选择所属菜单"
            style="width: 100%"
          >
            <el-option
              v-for="menu in menuOptions"
              :key="menu.id"
              :label="menu.name"
              :value="menu.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="权限描述" prop="description">
          <el-input
            v-model="permissionForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入权限描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Search, Refresh, Plus, Delete, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  id: '',
  name: '',
  type: ''
})

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: '仪表板',
    code: 'MENU_DASHBOARD',
    type: 'menu',
    description: '系统仪表板',
    isSystem: true,
    createTime: '2024-03-20 08:00:00'
  },
  {
    id: 2,
    name: '订单管理',
    code: 'MENU_ORDER',
    type: 'menu',
    description: '订单管理模块',
    isSystem: true,
    createTime: '2024-03-20 08:00:00'
  },
  {
    id: 3,
    name: '新增订单',
    code: 'BTN_ORDER_ADD',
    type: 'button',
    menuId: 2,
    menuName: '订单管理',
    description: '新增订单按钮',
    isSystem: false,
    createTime: '2024-03-20 08:00:00'
  }
])

// 菜单选项（用于按钮权限选择所属菜单）
const menuOptions = computed(() => {
  return tableData.value
    .filter(item => item.type === 'menu')
    .map(item => ({
      id: item.id,
      name: item.name
    }))
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 3
})

// 多选相关
const selectedRows = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const permissionFormRef = ref(null)

// 表单数据
const permissionForm = reactive({
  id: '',
  name: '',
  code: '',
  type: 'menu',
  menuId: undefined,
  description: '',
  isSystem: false
})

// 表单验证规则
const permissionFormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限标识符', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '标识符只能包含大写字母和下划线', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  menuId: [
    { required: true, message: '请选择所属菜单', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

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
    name: '',
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

// 新增权限
const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑权限
const handleEdit = (row) => {
  dialogType.value = 'edit'
  resetForm()
  Object.assign(permissionForm, {
    id: row.id,
    name: row.name,
    code: row.code,
    type: row.type,
    menuId: row.menuId,
    description: row.description,
    isSystem: row.isSystem
  })
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(permissionForm, {
    id: '',
    name: '',
    code: '',
    type: 'menu',
    menuId: undefined,
    description: '',
    isSystem: false
  })
  if (permissionFormRef.value) {
    permissionFormRef.value.resetFields()
  }
}

// 提交表单
const submitForm = () => {
  if (!permissionFormRef.value) return

  permissionFormRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true

      // 模拟API调用
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 新增权限
          const newPermission = {
            id: Math.max(...tableData.value.map(item => item.id)) + 1,
            name: permissionForm.name,
            code: permissionForm.code,
            type: permissionForm.type,
            description: permissionForm.description,
            isSystem: false,
            createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }

          // 如果是按钮权限，添加菜单信息
          if (permissionForm.type === 'button') {
            const menu = menuOptions.value.find(item => item.id === permissionForm.menuId)
            newPermission.menuId = permissionForm.menuId
            newPermission.menuName = menu ? menu.name : ''
          }

          tableData.value.push(newPermission)
          pagination.total += 1
          ElMessage.success('新增权限成功')
        } else {
          // 更新权限
          const index = tableData.value.findIndex(item => item.id === permissionForm.id)
          if (index !== -1) {
            const updatedPermission = {
              ...tableData.value[index],
              name: permissionForm.name,
              code: permissionForm.code,
              description: permissionForm.description
            }

            // 如果是按钮权限，更新菜单信息
            if (permissionForm.type === 'button') {
              const menu = menuOptions.value.find(item => item.id === permissionForm.menuId)
              updatedPermission.menuId = permissionForm.menuId
              updatedPermission.menuName = menu ? menu.name : ''
            }

            tableData.value[index] = updatedPermission
            ElMessage.success('更新权限成功')
          }
        }

        submitLoading.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

// 删除权限
const handleDelete = (row) => {
  if (row.isSystem) {
    ElMessage.warning('系统权限不能删除')
    return
  }

  ElMessageBox.confirm(
    `确定要删除权限 "${row.name}" 吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 如果是菜单权限，检查是否有关联的按钮权限
    if (row.type === 'menu') {
      const hasButtons = tableData.value.some(item => 
        item.type === 'button' && item.menuId === row.id
      )
      if (hasButtons) {
        ElMessage.warning('该菜单下还有按钮权限，请先删除按钮权限')
        return
      }
    }

    // 模拟API调用
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    pagination.total -= 1
    ElMessage.success(`已删除权限 "${row.name}"`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一个权限')
    return
  }

  // 检查是否包含系统权限
  const hasSystem = selectedRows.value.some(row => row.isSystem)
  if (hasSystem) {
    ElMessage.warning('选中的权限中包含系统权限，不能删除')
    return
  }

  // 检查是否有菜单权限包含按钮权限
  const menuIds = selectedRows.value
    .filter(row => row.type === 'menu')
    .map(row => row.id)
  
  if (menuIds.length > 0) {
    const hasButtons = tableData.value.some(item =>
      item.type === 'button' && menuIds.includes(item.menuId)
    )
    if (hasButtons) {
      ElMessage.warning('选中的菜单权限中有关联的按钮权限，请先删除按钮权限')
      return
    }
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个权限吗？此操作不可恢复！`,
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
    ElMessage.success(`已删除 ${selectedRows.value.length} 个权限`)
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 