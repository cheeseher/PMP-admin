<!-- 系统管理/菜单管理 - 菜单管理页面 -->
<template>
  <div class="menu-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" label-position="left" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="菜单名称：">
            <el-input v-model="searchForm.name" placeholder="请输入菜单名称" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="菜单状态：">
            <el-select v-model="searchForm.status" placeholder="请选择菜单状态" style="width: 168px" clearable>
              <el-option label="显示" value="1" />
              <el-option label="隐藏" value="0" />
            </el-select>
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
          <span class="table-title">菜单列表</span>
          <el-tag type="info" size="small" effect="plain">{{ tableData.length }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Plus" @click="handleAdd(null)">新增菜单</el-button>
          <el-tooltip content="展开/折叠">
            <el-button :icon="expandAll ? 'FolderOpened' : 'Folder'" plain @click="toggleExpand">{{ expandAll ? '折叠' : '展开' }}</el-button>
          </el-tooltip>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="refreshData" />
          </el-tooltip>
        </div>
      </div>
      
      <el-table
        ref="tableRef"
        :data="tableData"
        row-key="id"
        border
        :tree-props="{ children: 'children' }"
        :expand-row-keys="expandedRowKeys"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="name" label="菜单名称" min-width="180">
          <template #default="{ row }">
            <span v-if="row.type === 'menu'">
              <el-icon><Menu /></el-icon>
              {{ row.name }}
            </span>
            <span v-else-if="row.type === 'catalog'" style="font-weight: bold;">
              <el-icon><Folder /></el-icon>
              {{ row.name }}
            </span>
            <span v-else>
              <el-icon><Operation /></el-icon>
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="100" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="path" label="路径" min-width="180" show-overflow-tooltip />
        <el-table-column prop="component" label="组件路径" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.type === 'button'">-</span>
            <span v-else>{{ row.component }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限标识" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag v-if="row.permission" size="small" effect="plain">{{ row.permission }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'info'" size="small">
              {{ row.status === '1' ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'catalog'" type="primary" size="small">目录</el-tag>
            <el-tag v-else-if="row.type === 'menu'" type="success" size="small">菜单</el-tag>
            <el-tag v-else-if="row.type === 'button'" type="warning" size="small">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Plus" @click="handleAdd(scope.row)" v-if="scope.row.type !== 'button'">
              新增子菜单
            </el-button>
            <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              type="danger" 
              link 
              :icon="Delete" 
              @click="handleDelete(scope.row)"
              :disabled="hasChildren(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 菜单表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formTitle"
      width="650px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="menuFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <el-tree-select
                v-model="menuForm.parentId"
                :data="treeSelectData"
                check-strictly
                default-expand-all
                node-key="id"
                :render-after-expand="false"
                :props="{ label: 'name', value: 'id', children: 'children' }"
                placeholder="请选择上级菜单"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group v-model="menuForm.type">
                <el-radio label="catalog">目录</el-radio>
                <el-radio label="menu">菜单</el-radio>
                <el-radio label="button">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort">
              <el-input-number v-model="menuForm.sort" :min="1" :max="999" style="width: 100%" />
            </el-form-item>
          </el-col>
          
          <template v-if="menuForm.type !== 'button'">
            <el-col :span="12">
              <el-form-item 
                label="图标" 
                prop="icon"
                v-if="menuForm.type !== 'button'"
              >
                <el-select v-model="menuForm.icon" placeholder="请选择图标" style="width: 100%">
                  <el-option label="Dashboard" value="DataLine" />
                  <el-option label="商品" value="Goods" />
                  <el-option label="文档" value="Document" />
                  <el-option label="链接" value="Connection" />
                  <el-option label="货币" value="Money" />
                  <el-option label="设置" value="Setting" />
                  <el-option label="用户" value="User" />
                  <el-option label="统计" value="Histogram" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item 
                label="路由路径" 
                prop="path"
                v-if="menuForm.type !== 'button'"
              >
                <el-input v-model="menuForm.path" placeholder="请输入路由路径" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="menuForm.type === 'menu'">
              <el-form-item label="组件路径" prop="component">
                <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="显示状态" prop="status">
                <el-radio-group v-model="menuForm.status">
                  <el-radio label="1">显示</el-radio>
                  <el-radio label="0">隐藏</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </template>
          
          <el-col :span="12" v-if="menuForm.type === 'button'">
            <el-form-item label="权限标识" prop="permission">
              <el-input v-model="menuForm.permission" placeholder="请输入权限标识" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { ref, reactive, computed, nextTick } from 'vue'
import { Search, Refresh, Plus, Delete, Edit, Folder, FolderOpened, Menu, Operation } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  name: '',
  status: ''
})

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 展开状态
const expandAll = ref(false)
const expandedRowKeys = ref([])
const tableRef = ref(null)

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: '系统管理',
    type: 'catalog',
    path: '/system',
    component: '',
    permission: '',
    icon: 'Setting',
    sort: 1,
    status: '1',
    parentId: 0,
    createTime: '2024-03-20 08:00:00',
    children: [
      {
        id: 11,
        name: '管理员管理',
        type: 'menu',
        path: 'admin',
        component: 'system/AdminList',
        permission: 'system:admin:list',
        icon: 'User',
        sort: 1,
        status: '1',
        parentId: 1,
        createTime: '2024-03-20 08:00:00',
        children: [
          {
            id: 111,
            name: '管理员查询',
            type: 'button',
            path: '',
            component: '',
            permission: 'system:admin:query',
            icon: '',
            sort: 1,
            status: '1',
            parentId: 11,
            createTime: '2024-03-20 08:00:00'
          },
          {
            id: 112,
            name: '管理员新增',
            type: 'button',
            path: '',
            component: '',
            permission: 'system:admin:add',
            icon: '',
            sort: 2,
            status: '1',
            parentId: 11,
            createTime: '2024-03-20 08:00:00'
          },
          {
            id: 113,
            name: '管理员编辑',
            type: 'button',
            path: '',
            component: '',
            permission: 'system:admin:edit',
            icon: '',
            sort: 3,
            status: '1',
            parentId: 11,
            createTime: '2024-03-20 08:00:00'
          },
          {
            id: 114,
            name: '管理员删除',
            type: 'button',
            path: '',
            component: '',
            permission: 'system:admin:remove',
            icon: '',
            sort: 4,
            status: '1',
            parentId: 11,
            createTime: '2024-03-20 08:00:00'
          }
        ]
      },
      {
        id: 12,
        name: '角色管理',
        type: 'menu',
        path: 'role',
        component: 'system/RoleList',
        permission: 'system:role:list',
        icon: 'UserFilled',
        sort: 2,
        status: '1',
        parentId: 1,
        createTime: '2024-03-20 08:00:00',
        children: [
          {
            id: 121,
            name: '角色查询',
            type: 'button',
            path: '',
            component: '',
            permission: 'system:role:query',
            icon: '',
            sort: 1,
            status: '1',
            parentId: 12,
            createTime: '2024-03-20 08:00:00'
          },
          {
            id: 122,
            name: '角色新增',
            type: 'button',
            path: '',
            component: '',
            permission: 'system:role:add',
            icon: '',
            sort: 2,
            status: '1',
            parentId: 12,
            createTime: '2024-03-20 08:00:00'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: '商户管理',
    type: 'catalog',
    path: '/product',
    component: '',
    permission: '',
    icon: 'Goods',
    sort: 2,
    status: '1',
    parentId: 0,
    createTime: '2024-03-20 08:00:00',
    children: [
      {
        id: 21,
        name: '商户列表',
        type: 'menu',
        path: 'list',
        component: 'product/ProductList',
        permission: 'product:list',
        icon: 'List',
        sort: 1,
        status: '1',
        parentId: 2,
        createTime: '2024-03-20 08:00:00'
      }
    ]
  }
])

// 对话框相关
const dialogVisible = ref(false)
const menuFormRef = ref(null)

// 当前表单标题
const formTitle = computed(() => {
  if (dialogType.value === 'add') {
    if (menuForm.parentId === 0) {
      return '新增菜单'
    } else {
      const parentName = findParentName(menuForm.parentId)
      return `新增 "${parentName}" 的子菜单`
    }
  } else {
    return `编辑菜单 "${menuForm.name}"`
  }
})

// 查找父菜单名称
const findParentName = (parentId) => {
  let name = ''
  const findName = (menus, id) => {
    for (const menu of menus) {
      if (menu.id === id) {
        name = menu.name
        return true
      }
      if (menu.children && menu.children.length > 0) {
        if (findName(menu.children, id)) {
          return true
        }
      }
    }
    return false
  }
  findName(tableData.value, parentId)
  return name
}

// 树形选择数据
const treeSelectData = computed(() => {
  const root = { id: 0, name: '主目录', children: [] }
  // 添加非按钮类型的菜单项
  const addMenus = (menus) => {
    const result = []
    for (const menu of menus) {
      if (menu.type !== 'button') {
        const newMenu = { ...menu }
        if (menu.children && menu.children.length > 0) {
          newMenu.children = addMenus(menu.children)
        } else {
          newMenu.children = []
        }
        result.push(newMenu)
      }
    }
    return result
  }
  root.children = addMenus(tableData.value)
  return [root]
})

// 当前操作类型
const dialogType = ref('add')

// 表单数据
const menuForm = reactive({
  id: '',
  name: '',
  type: 'menu',
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 1,
  status: '1',
  parentId: 0
})

// 表单验证规则
const menuFormRules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择菜单类型', trigger: 'change' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur', validator: (rule, value, callback) => {
      if (menuForm.type === 'button') {
        callback()
      } else if (!value) {
        callback(new Error('请输入路由路径'))
      } else {
        callback()
      }
    }}
  ],
  component: [
    { required: true, message: '请输入组件路径', trigger: 'blur', validator: (rule, value, callback) => {
      if (menuForm.type !== 'menu') {
        callback()
      } else if (!value) {
        callback(new Error('请输入组件路径'))
      } else {
        callback()
      }
    }}
  ],
  permission: [
    { required: true, message: '请输入权限标识', trigger: 'blur', validator: (rule, value, callback) => {
      if (menuForm.type !== 'button') {
        callback()
      } else if (!value) {
        callback(new Error('请输入权限标识'))
      } else {
        callback()
      }
    }}
  ],
  sort: [
    { required: true, message: '请输入显示排序', trigger: 'blur' }
  ]
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  ElMessage.success('搜索条件已提交')
}

// 重置搜索条件
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
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

// 新增菜单
const handleAdd = (row) => {
  dialogType.value = 'add'
  resetForm()
  
  // 如果有父节点，设置父节点ID
  if (row) {
    menuForm.parentId = row.id
    // 如果父节点是目录，默认新增为菜单
    if (row.type === 'catalog') {
      menuForm.type = 'menu'
    }
    // 如果父节点是菜单，默认新增为按钮
    else if (row.type === 'menu') {
      menuForm.type = 'button'
    }
  } else {
    menuForm.parentId = 0
    menuForm.type = 'catalog'
  }
  
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = (row) => {
  dialogType.value = 'edit'
  resetForm()
  
  nextTick(() => {
    Object.assign(menuForm, {
      id: row.id,
      name: row.name,
      type: row.type,
      path: row.path,
      component: row.component,
      permission: row.permission,
      icon: row.icon,
      sort: row.sort,
      status: row.status,
      parentId: row.parentId
    })
    
    dialogVisible.value = true
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(menuForm, {
    id: '',
    name: '',
    type: 'menu',
    path: '',
    component: '',
    permission: '',
    icon: '',
    sort: 1,
    status: '1',
    parentId: 0
  })
  
  if (menuFormRef.value) {
    menuFormRef.value.resetFields()
  }
}

// 提交表单
const submitForm = () => {
  if (!menuFormRef.value) return
  
  menuFormRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      
      // 模拟API调用
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 新增菜单
          const newMenu = {
            id: new Date().getTime(),
            name: menuForm.name,
            type: menuForm.type,
            path: menuForm.path,
            component: menuForm.component,
            permission: menuForm.permission,
            icon: menuForm.icon,
            sort: menuForm.sort,
            status: menuForm.status,
            parentId: menuForm.parentId,
            createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            children: []
          }
          
          // 添加到父节点
          if (menuForm.parentId === 0) {
            tableData.value.push(newMenu)
          } else {
            const addToParent = (menus, parentId, newChild) => {
              for (const menu of menus) {
                if (menu.id === parentId) {
                  if (!menu.children) {
                    menu.children = []
                  }
                  menu.children.push(newChild)
                  return true
                }
                if (menu.children && menu.children.length > 0) {
                  if (addToParent(menu.children, parentId, newChild)) {
                    return true
                  }
                }
              }
              return false
            }
            
            addToParent(tableData.value, menuForm.parentId, newMenu)
          }
          
          ElMessage.success('新增菜单成功')
        } else {
          // 更新菜单
          const updateMenu = (menus, updatedMenu) => {
            for (let i = 0; i < menus.length; i++) {
              if (menus[i].id === updatedMenu.id) {
                // 保留子节点
                const children = menus[i].children || []
                menus[i] = { ...updatedMenu, children }
                return true
              }
              if (menus[i].children && menus[i].children.length > 0) {
                if (updateMenu(menus[i].children, updatedMenu)) {
                  return true
                }
              }
            }
            return false
          }
          
          updateMenu(tableData.value, {
            id: menuForm.id,
            name: menuForm.name,
            type: menuForm.type,
            path: menuForm.path,
            component: menuForm.component,
            permission: menuForm.permission,
            icon: menuForm.icon,
            sort: menuForm.sort,
            status: menuForm.status,
            parentId: menuForm.parentId
          })
          
          ElMessage.success('更新菜单成功')
        }
        
        submitLoading.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

// 检查是否有子菜单
const hasChildren = (row) => {
  return row.children && row.children.length > 0
}

// 删除菜单
const handleDelete = (row) => {
  if (hasChildren(row)) {
    ElMessage.warning(`菜单"${row.name}"下还有子菜单，不能删除`)
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除菜单 "${row.name}" 吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 从父节点中删除
    const removeFromParent = (menus, id) => {
      for (let i = 0; i < menus.length; i++) {
        if (menus[i].id === id) {
          menus.splice(i, 1)
          return true
        }
        if (menus[i].children && menus[i].children.length > 0) {
          if (removeFromParent(menus[i].children, id)) {
            return true
          }
        }
      }
      return false
    }
    
    removeFromParent(tableData.value, row.id)
    ElMessage.success(`已删除菜单 "${row.name}"`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 展开/折叠所有
const toggleExpand = () => {
  expandAll.value = !expandAll.value
  
  if (expandAll.value) {
    // 展开所有行
    const expandKeys = []
    const getKeys = (menus) => {
      for (const menu of menus) {
        expandKeys.push(menu.id)
        if (menu.children && menu.children.length > 0) {
          getKeys(menu.children)
        }
      }
    }
    getKeys(tableData.value)
    expandedRowKeys.value = expandKeys
  } else {
    // 折叠所有行
    expandedRowKeys.value = []
  }
}
</script>

<style scoped>
.menu-list-container {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 