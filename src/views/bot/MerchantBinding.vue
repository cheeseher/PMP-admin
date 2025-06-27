<!-- 机器人管理/商户绑定管理 - 管理 Telegram 用户与商户的绑定关系 -->
<template>
  <div class="merchant-binding-container">
    <!-- 筛选表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="filterForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="商户名称：">
            <el-input 
              v-model="filterForm.merchantName" 
              placeholder="请输入商户名称" 
              clearable 
              style="width: 180px" 
            />
          </el-form-item>
          <el-form-item label="绑定用户：">
            <el-input 
              v-model="filterForm.username" 
              placeholder="请输入Telegram用户名" 
              clearable 
              style="width: 180px" 
            />
          </el-form-item>
          <el-form-item label="所属机器人：">
            <el-select 
              v-model="filterForm.botId" 
              placeholder="请选择机器人" 
              clearable
              style="width: 168px"
            >
              <el-option 
                v-for="item in botOptions" 
                :key="item.id" 
                :label="item.name" 
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态：">
            <el-select 
              v-model="filterForm.status" 
              placeholder="请选择状态" 
              clearable
              style="width: 168px"
            >
              <el-option label="全部" value="" />
              <el-option label="正常" value="normal" />
              <el-option label="已解绑" value="unbound" />
            </el-select>
          </el-form-item>
        </div>
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="resetFilter">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据展示区域 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="openBindingDialog('add')">新增绑定</el-button>
        </div>
        <div class="right">
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="handleSearch" />
          </el-tooltip>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="merchantName" label="商户名称" min-width="140" />
        <el-table-column prop="merchantId" label="商户ID" min-width="120" />
        <el-table-column prop="username" label="绑定用户" min-width="140" />
        <el-table-column prop="userId" label="用户ID" min-width="120" />
        <el-table-column prop="botName" label="所属机器人" width="140" />
        <el-table-column prop="bindType" label="绑定类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.bindType === 'user' ? 'success' : 'primary'" size="small">
              {{ row.bindType === 'user' ? '用户' : '群组' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bindTime" label="绑定时间" min-width="160" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'info'" effect="plain">
              {{ row.status === 'normal' ? '正常' : '已解绑' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button type="primary" link class="operation-button">
                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit" v-if="row.status === 'normal'">编辑</el-dropdown-item>
                  <el-dropdown-item command="unbind" v-if="row.status === 'normal'">解绑</el-dropdown-item>
                  <el-dropdown-item command="rebind" v-if="row.status === 'unbound'">重新绑定</el-dropdown-item>
                  <el-dropdown-item command="delete" style="color: red;">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 绑定表单对话框 -->
    <el-dialog
      v-model="bindingDialogVisible"
      :title="dialogType === 'add' ? '新增绑定' : '编辑绑定'"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="bindingFormRef"
        :model="bindingForm"
        :rules="bindingRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="所属机器人" prop="botId">
          <el-select 
            v-model="bindingForm.botId" 
            placeholder="请选择机器人" 
            style="width: 100%"
            :disabled="dialogType === 'edit'"
          >
            <el-option 
              v-for="item in botOptions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定类型" prop="bindType">
          <el-radio-group 
            v-model="bindingForm.bindType"
            :disabled="dialogType === 'edit'"
          >
            <el-radio label="user">用户绑定</el-radio>
            <el-radio label="group">群组绑定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="bindingForm.bindType === 'user' ? 'Telegram用户' : 'Telegram群组'" prop="telegramId">
          <el-input 
            v-model="bindingForm.telegramId" 
            :placeholder="bindingForm.bindType === 'user' ? '请输入Telegram用户ID或用户名' : '请输入Telegram群组ID'"
            :disabled="dialogType === 'edit'"
          />
          <div class="form-tip">
            {{ bindingForm.bindType === 'user' 
              ? '可以输入数字ID或带@的用户名，例如: 123456789 或 @username' 
              : '请输入群组的数字ID，例如: -100123456789' }}
          </div>
        </el-form-item>
        <el-form-item label="商户选择" prop="merchantId">
          <el-select 
            v-model="bindingForm.merchantId" 
            filterable
            remote
            reserve-keyword
            placeholder="请输入商户名称搜索"
            :remote-method="searchMerchants"
            :loading="merchantsLoading"
            style="width: 100%"
          >
            <el-option 
              v-for="item in merchantOptions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ item.name }}</span>
                <span style="color: #999; font-size: 12px">{{ item.id }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色选择" prop="roleId">
          <el-select 
            v-model="bindingForm.roleId" 
            placeholder="请选择绑定角色" 
            style="width: 100%"
          >
            <el-option 
              v-for="item in roleOptions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id"
            />
          </el-select>
          <div class="form-tip">绑定角色将决定该用户/群组可以使用的指令范围</div>
        </el-form-item>
        <el-form-item label="是否需要审批" prop="needApproval">
          <el-switch
            v-model="bindingForm.needApproval"
            active-text="是"
            inactive-text="否"
          />
          <div class="form-tip">开启后，该绑定关系下的敏感操作指令将需要管理员审批</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="bindingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBindingForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, ArrowDown } from '@element-plus/icons-vue'

// 机器人选项数据
const botOptions = ref([
  { id: 1, name: '思方支付助手' },
  { id: 2, name: '客服机器人' }
])

// 角色选项数据
const roleOptions = ref([
  { id: 1, name: '超级管理员' },
  { id: 2, name: '客服' },
  { id: 3, name: '商户' }
])

// 筛选表单
const filterForm = reactive({
  merchantName: '',
  username: '',
  botId: '',
  status: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    merchantName: 'A商户',
    merchantId: 'M001',
    username: 'zhangsan',
    userId: '123456789',
    botId: 1,
    botName: '思方支付助手',
    bindType: 'user',
    bindTime: '2025-03-18 11:00:00',
    status: 'normal',
    roleId: 3,
    needApproval: false
  },
  {
    id: 2,
    merchantName: 'B商户',
    merchantId: 'M002',
    username: 'lisi',
    userId: '987654321',
    botId: 1,
    botName: '思方支付助手',
    bindType: 'user',
    bindTime: '2025-03-17 14:00:00',
    status: 'normal',
    roleId: 3,
    needApproval: true
  },
  {
    id: 3,
    merchantName: 'C商户',
    merchantId: 'M003',
    username: '财务群',
    userId: '-1001234567890',
    botId: 2,
    botName: '客服机器人',
    bindType: 'group',
    bindTime: '2025-03-16 16:30:00',
    status: 'unbound',
    roleId: 2,
    needApproval: false
  }
])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(3)
const loading = ref(false)

// 商户搜索
const merchantsLoading = ref(false)
const merchantOptions = ref([])

// 绑定表单对话框
const bindingDialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const bindingFormRef = ref(null)
const bindingForm = reactive({
  id: null,
  botId: '',
  bindType: 'user',
  telegramId: '',
  merchantId: '',
  roleId: '',
  needApproval: false
})

// 表单验证规则
const bindingRules = {
  botId: [{ required: true, message: '请选择所属机器人', trigger: 'change' }],
  bindType: [{ required: true, message: '请选择绑定类型', trigger: 'change' }],
  telegramId: [{ required: true, message: '请输入Telegram用户或群组信息', trigger: 'blur' }],
  merchantId: [{ required: true, message: '请选择商户', trigger: 'change' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 搜索方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.merchantName = ''
  filterForm.username = ''
  filterForm.botId = ''
  filterForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

// 远程搜索商户
const searchMerchants = (query) => {
  if (query) {
    merchantsLoading.value = true
    setTimeout(() => {
      merchantsLoading.value = false
      merchantOptions.value = [
        { id: 'M001', name: 'A商户' },
        { id: 'M002', name: 'B商户' },
        { id: 'M003', name: 'C商户' },
        { id: 'M004', name: 'D商户' }
      ].filter(item => {
        return item.name.toLowerCase().includes(query.toLowerCase())
      })
    }, 200)
  } else {
    merchantOptions.value = []
  }
}

// 处理下拉命令
const handleCommand = (command, row) => {
  switch (command) {
    case 'edit':
      openBindingDialog('edit', row)
      break
    case 'unbind':
      handleUnbind(row)
      break
    case 'rebind':
      handleRebind(row)
      break
    case 'delete':
      handleDeleteBinding(row)
      break
  }
}

// 打开绑定表单对话框
const openBindingDialog = (type, row) => {
  dialogType.value = type
  
  // 重置表单
  bindingForm.id = null
  bindingForm.botId = ''
  bindingForm.bindType = 'user'
  bindingForm.telegramId = ''
  bindingForm.merchantId = ''
  bindingForm.roleId = ''
  bindingForm.needApproval = false
  merchantOptions.value = []

  if (type === 'edit' && row) {
    bindingForm.id = row.id
    bindingForm.botId = row.botId
    bindingForm.bindType = row.bindType
    bindingForm.telegramId = row.userId // 用户/群组ID
    bindingForm.merchantId = row.merchantId
    bindingForm.roleId = row.roleId
    bindingForm.needApproval = row.needApproval
    
    // 回显商户信息
    merchantOptions.value = [{ id: row.merchantId, name: row.merchantName }]
  }
  
  bindingDialogVisible.value = true
}

// 提交绑定表单
const submitBindingForm = () => {
  bindingFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟提交
      loading.value = true
      setTimeout(() => {
        const bot = botOptions.value.find(b => b.id === bindingForm.botId)
        const merchant = merchantOptions.value.find(m => m.id === bindingForm.merchantId)
        
        if (dialogType.value === 'add') {
          const newBinding = {
            id: tableData.value.length + 1,
            merchantName: merchant ? merchant.name : '',
            merchantId: bindingForm.merchantId,
            username: `用户/群组 ${bindingForm.telegramId}`, // 模拟
            userId: bindingForm.telegramId,
            botId: bindingForm.botId,
            botName: bot ? bot.name : '',
            bindType: bindingForm.bindType,
            bindTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'normal',
            roleId: bindingForm.roleId,
            needApproval: bindingForm.needApproval
          }
          tableData.value.push(newBinding)
          total.value++
          ElMessage.success('绑定成功')
        } else {
          const index = tableData.value.findIndex(item => item.id === bindingForm.id)
          if (index !== -1) {
            tableData.value[index] = {
              ...tableData.value[index],
              merchantId: bindingForm.merchantId,
              merchantName: merchant ? merchant.name : tableData.value[index].merchantName,
              roleId: bindingForm.roleId,
              needApproval: bindingForm.needApproval
            }
            ElMessage.success('更新成功')
          }
        }
        loading.value = false
        bindingDialogVisible.value = false
      }, 1000)
    }
  })
}

// 解绑
const handleUnbind = (row) => {
  ElMessageBox.confirm('确认解绑该关系?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    setTimeout(() => {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value[index].status = 'unbound'
        ElMessage.success('解绑成功')
      }
      loading.value = false
    }, 500)
  }).catch(() => {})
}

// 重新绑定
const handleRebind = (row) => {
  ElMessageBox.confirm('确认重新绑定该关系?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    setTimeout(() => {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value[index].status = 'normal'
        ElMessage.success('重新绑定成功')
      }
      loading.value = false
    }, 500)
  }).catch(() => {})
}

// 删除绑定关系
const handleDeleteBinding = (row) => {
  ElMessageBox.confirm('确认永久删除该绑定记录?', '危险操作', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    loading.value = true
    setTimeout(() => {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value.splice(index, 1)
        total.value--
        ElMessage.success('删除成功')
      }
      loading.value = false
    }, 500)
  }).catch(() => {})
}

// 生命周期钩子
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.merchant-binding-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}

.filter-buttons {
  display: flex;
  margin-left: auto;
  align-items: flex-start;
}

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-toolbar .left {
  display: flex;
  gap: 10px;
}

.table-toolbar .right {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
  padding-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.dialog-footer .el-button {
  margin-left: 12px;
}

.operation-button {
  display: flex;
  align-items: center;
}
</style> 