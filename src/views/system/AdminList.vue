<!-- 系统管理/管理员管理 - 管理员账号管理页面 -->
<template>
  <div class="admin-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" label-position="left" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="管理员ID：">
            <el-input v-model="searchForm.id" placeholder="请输入管理员ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="管理员账户：">
            <el-input v-model="searchForm.username" placeholder="请输入管理员账户" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="昵称：">
            <el-input v-model="searchForm.realName" placeholder="请输入昵称" style="width: 168px" clearable />
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
          <span class="table-title">管理员列表</span>
          <el-tag type="info" size="small" effect="plain">{{ pagination.total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增管理员</el-button>
          <el-button plain :disabled="!multipleSelection.length" :icon="Delete" @click="handleBatchDelete">批量删除</el-button>
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
        <el-table-column prop="id" label="管理员ID" min-width="80" fixed="left" />
        <el-table-column prop="username" label="账号" min-width="120" />
        <el-table-column prop="realName" label="昵称" min-width="100" />
        <el-table-column prop="lastLoginIp" label="上次登录IP" min-width="120" />
        <el-table-column prop="loginCount" label="登录次数" min-width="80" align="center" />
        <el-table-column prop="googleAuth" label="Google 认证" min-width="110" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.googleAuth ? 'success' : 'info'" size="small">
              {{ scope.row.googleAuth ? '已绑定' : '未绑定' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="角色" min-width="100" />
        <el-table-column prop="status" label="状态" min-width="80" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isEnabled"
              @change="(val) => handleStatusChange(scope.row, val)"
              :loading="scope.row.statusLoading"
              :active-value="true"
              :inactive-value="false"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" fixed="right">
          <template #default="scope">
            <el-dropdown trigger="click" @command="(command) => handleCommand(command, scope.row)">
              <el-button type="primary" link>
                操作 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="resetGoogle">
                    重置Google验证
                  </el-dropdown-item>
                  <el-divider style="margin: 6px 0" />
                  <el-dropdown-item command="delete" style="color: #f56c6c">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <!-- 新增/编辑管理员弹窗 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增管理员' : '编辑管理员'"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="resetForm"
    >
      <el-form
        ref="adminFormRef"
        :model="adminForm"
        :rules="adminFormRules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="账号" prop="username">
          <el-input v-model="adminForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="昵称" prop="realName">
          <el-input v-model="adminForm.realName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item 
          label="密码" 
          prop="password"
          :rules="dialogType === 'add' ? [{ required: true, message: '请输入密码', trigger: 'blur' }] : []"
        >
          <el-input 
            v-model="adminForm.password" 
            type="password" 
            show-password
            placeholder="不填表示不更新密码"
          />
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-checkbox-group v-model="adminForm.roles">
            <el-checkbox label="customer_service">客服</el-checkbox>
            <el-checkbox label="operator">运营</el-checkbox>
            <el-checkbox label="administrator">Administrator</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="adminForm.isEnabled" />
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
import { Search, Refresh, Plus, Edit, Delete, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  id: '',
  username: '',
  realName: '',
})

// 加载状态
const loading = ref(false)

// 多选数据
const multipleSelection = ref([])

// 表格数据
const tableData = ref([
  {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    roleName: '超级管理员',
    roles: ['administrator'],
    mobile: '13800138000',
    lastLoginTime: '2025-03-24 10:00:00',
    lastLoginIp: '192.168.1.1',
    loginCount: 286,
    googleAuth: true,
    status: 'enabled',
    isEnabled: true,
    statusLoading: false,
    createTime: '2025-03-20 08:00:00'
  },
  {
    id: 2,
    username: 'operator',
    realName: '运营人员',
    roleName: '运营管理员',
    roles: ['operator'],
    mobile: '13900139000',
    lastLoginTime: '2025-03-23 16:30:00',
    lastLoginIp: '192.168.1.2',
    loginCount: 153,
    googleAuth: true,
    status: 'enabled',
    isEnabled: true,
    statusLoading: false,
    createTime: '2025-03-21 09:15:00'
  },
  {
    id: 3,
    username: 'finance',
    realName: '财务人员',
    roleName: '财务管理员',
    roles: ['customer_service', 'operator'],
    mobile: '13700137000',
    lastLoginTime: '2025-03-22 14:20:00',
    lastLoginIp: '192.168.1.3',
    loginCount: 42,
    googleAuth: false,
    status: 'disabled',
    isEnabled: false,
    statusLoading: false,
    createTime: '2025-03-22 10:30:00'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 3
})

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

// 批量删除
const handleBatchDelete = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请至少选择一项进行删除')
    return
  }

  const names = multipleSelection.value.map(item => item.username).join('、')
  const ids = multipleSelection.value.map(item => item.id)

  ElMessageBox.confirm(
    `确定要删除选中的 ${multipleSelection.value.length} 个管理员吗？此操作不可恢复！\n${names}`, 
    '警告', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    tableData.value = tableData.value.filter(item => !ids.includes(item.id))
    pagination.total -= multipleSelection.value.length
    multipleSelection.value = []
    ElMessage.success('已批量删除选中的管理员')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
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
    username: '',
    realName: '',
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

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const submitLoading = ref(false)
const adminFormRef = ref(null)

// 管理员表单数据
const adminForm = reactive({
  id: '',
  username: '',
  realName: '',
  password: '',
  roles: [],
  isEnabled: true
})

// 表单验证规则
const adminFormRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  roles: [
    { type: 'array', required: true, message: '请至少选择一个角色', trigger: 'change' }
  ]
}

// 重置表单
const resetForm = () => {
  if (adminFormRef.value) {
    adminFormRef.value.resetFields()
  }
  Object.assign(adminForm, {
    id: '',
    username: '',
    realName: '',
    password: '',
    roles: [],
    isEnabled: true
  })
}

// 添加管理员
const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑管理员
const handleEdit = (row) => {
  dialogType.value = 'edit'
  resetForm()
  
  // 填充表单数据
  Object.assign(adminForm, {
    id: row.id,
    username: row.username,
    realName: row.realName,
    password: '', // 编辑时不显示密码
    roles: row.roles || [],
    isEnabled: row.isEnabled
  })
  
  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  if (!adminFormRef.value) return
  
  adminFormRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      
      // 模拟API调用
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 新增管理员
          const newAdmin = {
            id: tableData.value.length + 1,
            username: adminForm.username,
            realName: adminForm.realName,
            roleName: getRoleName(adminForm.roles),
            roles: [...adminForm.roles],
            mobile: '',
            lastLoginTime: '',
            lastLoginIp: '',
            loginCount: 0,
            googleAuth: false,
            status: adminForm.isEnabled ? 'enabled' : 'disabled',
            isEnabled: adminForm.isEnabled,
            statusLoading: false,
            createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }
          
          tableData.value.push(newAdmin)
          pagination.total += 1
          ElMessage.success(`管理员 "${adminForm.username}" 创建成功`)
        } else {
          // 更新管理员
          const index = tableData.value.findIndex(item => item.id === adminForm.id)
          if (index !== -1) {
            const updatedAdmin = {
              ...tableData.value[index],
              realName: adminForm.realName,
              roleName: getRoleName(adminForm.roles),
              roles: [...adminForm.roles],
              status: adminForm.isEnabled ? 'enabled' : 'disabled',
              isEnabled: adminForm.isEnabled
            }
            
            // 如果有密码，就更新密码
            if (adminForm.password) {
              console.log('更新密码', adminForm.password)
            }
            
            tableData.value[index] = updatedAdmin
            ElMessage.success(`管理员 "${adminForm.username}" 更新成功`)
          }
        }
        
        submitLoading.value = false
        dialogVisible.value = false
      }, 800)
    }
  })
}

// 获取角色名称
const getRoleName = (roles) => {
  if (!roles || roles.length === 0) return ''
  
  const roleMap = {
    'customer_service': '客服',
    'operator': '运营',
    'administrator': '管理员'
  }
  
  if (roles.includes('administrator')) {
    return '超级管理员'
  } else if (roles.includes('operator')) {
    return '运营管理员'
  } else if (roles.includes('customer_service')) {
    return '客服人员'
  }
  
  return roles.map(role => roleMap[role] || role).join('/')
}

// 处理状态更改
const handleStatusChange = (row, val) => {
  row.statusLoading = true
  
  // 模拟API调用
  setTimeout(() => {
    row.status = val ? 'enabled' : 'disabled'
    row.statusLoading = false
    ElMessage.success(`已${val ? '启用' : '禁用'}管理员 "${row.username}"`)
  }, 500)
}

// 处理下拉菜单命令
const handleCommand = (command, row) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'delete':
      handleDelete(row)
      break
    case 'resetGoogle':
      handleResetGoogle(row)
      break
  }
}

// 重置Google绑定
const handleResetGoogle = (row) => {
  ElMessageBox.confirm(
    `确定要重置管理员 "${row.username}" 的Google验证吗？重置后该账户将无法使用Google验证登录。`, 
    '重置Google验证', 
    {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    row.googleAuth = false
    ElMessage.success(`已重置管理员 "${row.username}" 的Google验证`)
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

.table-action-button {
  font-size: 14px;
}

.table-action-button + .table-action-button {
  margin-left: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>