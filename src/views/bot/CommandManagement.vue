<!-- 机器人管理/指令管理 - 配置可分配给群组的指令 -->
<template>
  <div class="command-management-container">


    <!-- 筛选表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="filterForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="关键词：">
            <el-input 
              v-model="filterForm.keyword" 
              placeholder="请输入指令关键词" 
              clearable 
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="状态：">
            <el-select 
              v-model="filterForm.status" 
              placeholder="请选择状态" 
              clearable
              style="width: 168px"
            >
              <el-option label="全部" value="" />
              <el-option label="启用" value="enabled" />
              <el-option label="停用" value="disabled" />
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
      <!-- 标签页 -->
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="预设指令" name="default">
          <!-- 预设指令表格工具栏 -->
          <div class="table-toolbar">
            <div class="left">
              <el-alert
                type="info"
                show-icon
                :closable="false"
                style="margin-bottom: 0"
              >
                <template #title>
                  <span>预设指令为系统内置指令，不支持新增，仅可编辑状态和配置</span>
                </template>
              </el-alert>
            </div>
            <div class="right">
              <el-tooltip content="刷新数据">
                <el-button :icon="Refresh" circle plain @click="handleSearch" />
              </el-tooltip>
            </div>
          </div>

          <!-- 预设指令数据表格 -->
          <el-table
            v-loading="loading"
            :data="defaultCommands"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="keyword" label="指令关键词" min-width="120" />
            <el-table-column prop="format" label="示例格式" min-width="160" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" effect="plain">
                  {{ row.status === 'enabled' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="180" align="center">
              <template #default="{ row }">
                <el-dropdown @command="(command) => handleCommand(command, row)">
                  <el-button type="primary" link class="operation-button">
                    操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item :command="row.status === 'enabled' ? 'disable' : 'enable'">
                        {{ row.status === 'enabled' ? '停用' : '启用' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" style="color: red;">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="自定义指令" name="other">
          <!-- 自定义指令表格工具栏 -->
          <div class="table-toolbar">
            <div class="left">
              <el-button type="primary" :icon="Plus" @click="openCommandDialog('add', 'other')">新增自定义指令</el-button>
            </div>
            <div class="right">
              <el-tooltip content="刷新数据">
                <el-button :icon="Refresh" circle plain @click="handleSearch" />
              </el-tooltip>
            </div>
          </div>

          <!-- 自定义指令数据表格 -->
          <el-table
            v-loading="loading"
            :data="otherCommands"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="keyword" label="指令关键词" min-width="120" />
            <el-table-column prop="format" label="示例格式" min-width="160" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" effect="plain">
                  {{ row.status === 'enabled' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="180" align="center">
              <template #default="{ row }">
                <el-dropdown @command="(command) => handleCommand(command, row)">
                  <el-button type="primary" link class="operation-button">
                    操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item :command="row.status === 'enabled' ? 'disable' : 'enable'">
                        {{ row.status === 'enabled' ? '停用' : '启用' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" style="color: red;">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="activeTab === 'default' ? defaultCommandTotal : otherCommandTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 指令表单对话框 -->
    <el-dialog
      v-model="commandDialogVisible"
      :title="dialogType === 'add' ? '新增自定义指令' : `${dialogType === 'edit' && commandForm.type === 'default' ? '编辑预设指令' : '编辑自定义指令'}`"
      width="650px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="commandFormRef"
        :model="commandForm"
        :rules="commandRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="指令类型" prop="type" v-if="dialogType === 'edit'">
          <el-radio-group v-model="commandForm.type" disabled>
            <el-radio label="default">预设指令</el-radio>
            <el-radio label="other">自定义指令</el-radio>
          </el-radio-group>
          <div class="form-tip">预设指令为系统内置基础指令，自定义指令为自定义扩展指令</div>
        </el-form-item>
        <el-form-item label="指令关键词" prop="keyword">
          <el-input 
            v-model="commandForm.keyword" 
            placeholder="请输入指令关键词，如：ye"
          />
        </el-form-item>
        <el-form-item label="示例格式" prop="format">
          <el-input 
            v-model="commandForm.format" 
            placeholder="请输入示例格式，如：ye#商户名"
          />
        </el-form-item>
        <el-form-item label="响应模板" prop="responseTemplate">
          <el-input 
            v-model="commandForm.responseTemplate"
            type="textarea"
            :rows="6"
            placeholder="支持 Mustache 模板语法，如：您当前配置的支付产品如下：
{{#each products}}
- {{name}}（{{code}}）
{{/each}}"
          />
          <div class="form-tip">支持 Mustache 变量替换语法，使用 {{变量名}} 引用变量</div>
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-switch
            v-model="commandForm.statusEnabled"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="commandDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCommandForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, ArrowDown } from '@element-plus/icons-vue'

// 显示信息卡片
// 移除了说明卡片

// 标签页相关
const activeTab = ref('default');

// 筛选表单
const filterForm = reactive({
  keyword: '',
  status: ''
})

// 表格数据
const allCommands = ref([
  {
    id: 1,
    keyword: '产品',
    format: '产品',
    responseTemplate: '您当前配置的支付产品如下：\n{{#each products}}\n- {{name}}（{{code}}）\n{{/each}}',
    requiresBinding: true,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 2,
    keyword: '余额',
    format: '余额',
    responseTemplate: '商户 {{merchantName}} 的当前余额为：¥{{balance}}',
    requiresBinding: true,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 3,
    keyword: '绑定',
    format: '绑定#商户号#商户密钥',
    responseTemplate: '商户 {{merchantName}} 绑定成功！',
    requiresBinding: false,
    status: 'enabled',
    type: 'other' // 自定义指令
  },
  {
    id: 4,
    keyword: '订单',
    format: '订单#订单号',
    responseTemplate: '订单 {{orderId}} 的状态为：{{orderStatus}}',
    requiresBinding: true,
    status: 'enabled',
    type: 'other' // 自定义指令
  },
  {
    id: 5,
    keyword: '帮助',
    format: '帮助',
    responseTemplate: '可用指令列表：\n{{#each commands}}\n- {{keyword}}：{{description}}\n{{/each}}',
    requiresBinding: false,
    status: 'enabled',
    type: 'default' // 预设指令
  }
])

// 过滤指令数据，根据类型和筛选条件
const defaultCommands = computed(() => {
  return filterCommands(allCommands.value.filter(cmd => cmd.type === 'default'));
})

const otherCommands = computed(() => {
  return filterCommands(allCommands.value.filter(cmd => cmd.type === 'other'));
})

// 根据筛选条件过滤指令
const filterCommands = (commands) => {
  if (!filterForm.keyword && !filterForm.status) {
    return commands;
  }
  
  return commands.filter(cmd => {
    const matchKeyword = !filterForm.keyword || 
      cmd.keyword.toLowerCase().includes(filterForm.keyword.toLowerCase());
    const matchStatus = !filterForm.status || cmd.status === filterForm.status;
    
    return matchKeyword && matchStatus;
  });
}

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const defaultCommandTotal = computed(() => defaultCommands.value.length)
const otherCommandTotal = computed(() => otherCommands.value.length)
const loading = ref(false)

// 指令表单对话框
const commandDialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const commandType = ref('default') // 'default' 或 'other'
const commandFormRef = ref(null)
const commandForm = reactive({
  id: null,
  keyword: '',
  format: '',
  responseTemplate: '',
  requiresBinding: true,
  statusEnabled: true,
  type: 'default' // 默认为预设指令
})

// 表单验证规则
const commandRules = {
  keyword: [
    { required: true, message: '请输入指令关键词', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  format: [
    { required: true, message: '请输入指令示例格式', trigger: 'blur' }
  ],
  responseTemplate: [
    { required: true, message: '请输入响应模板', trigger: 'blur' }
  ]
}

// 标签页切换处理
const handleTabChange = (tab) => {
  currentPage.value = 1;
  activeTab.value = tab.props.name;
  handleSearch();
}

// 搜索方法
const handleSearch = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.keyword = ''
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

// 处理下拉命令
const handleCommand = (command, row) => {
  switch (command) {
    case 'edit':
      openCommandDialog('edit', row.type, row)
      break
    case 'enable':
      toggleCommandStatus(row, 'enabled')
      break
    case 'disable':
      toggleCommandStatus(row, 'disabled')
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 打开指令表单对话框
const openCommandDialog = (type, cmdType, row) => {
  dialogType.value = type
  commandType.value = cmdType
  commandDialogVisible.value = true
  
  // 重置表单
  nextTick(() => {
    if (commandFormRef.value) {
      commandFormRef.value.resetFields()
    }
    
    commandForm.id = null
    commandForm.keyword = ''
    commandForm.format = ''
    commandForm.responseTemplate = ''
    commandForm.requiresBinding = false
    commandForm.statusEnabled = true
    
    // 新增指令时强制设置为自定义指令类型
    if (type === 'add') {
      commandForm.type = 'other' // 自定义指令
    } else if (type === 'edit' && row) {
      commandForm.id = row.id
      commandForm.keyword = row.keyword
      commandForm.format = row.format
      commandForm.responseTemplate = row.responseTemplate
      commandForm.requiresBinding = row.requiresBinding
      commandForm.statusEnabled = row.status === 'enabled'
      commandForm.type = row.type
    }
  })
}

// 提交指令表单
const submitCommandForm = () => {
  commandFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 添加新记录 - 始终设置为自定义指令
          const newCommand = {
            id: Date.now(),
            keyword: commandForm.keyword,
            format: commandForm.format,
            responseTemplate: commandForm.responseTemplate,
            requiresBinding: false,
            status: commandForm.statusEnabled ? 'enabled' : 'disabled',
            type: 'other' // 强制设置为自定义指令
          }
          allCommands.value.unshift(newCommand)
          ElMessage.success('自定义指令添加成功')
        } else {
          // 更新现有记录
          const index = allCommands.value.findIndex(item => item.id === commandForm.id)
          if (index !== -1) {
            allCommands.value[index] = {
              ...allCommands.value[index],
              keyword: commandForm.keyword,
              format: commandForm.format,
              responseTemplate: commandForm.responseTemplate,
              requiresBinding: false,
              status: commandForm.statusEnabled ? 'enabled' : 'disabled',
              type: commandForm.type // 更新指令类型
            }
            ElMessage.success('指令更新成功')
          }
        }
        loading.value = false
        commandDialogVisible.value = false
      }, 1000)
    }
  })
}

// 切换指令状态
const toggleCommandStatus = (row, status) => {
  updateCommandStatus(row, status);
}

// 更新指令状态
const updateCommandStatus = (row, status) => {
  const index = allCommands.value.findIndex(item => item.id === row.id);
  if (index !== -1) {
    allCommands.value[index].status = status;
    ElMessage.success(`指令${status === 'enabled' ? '启用' : '禁用'}成功`);
  }
}

// 删除指令
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除指令 "${row.keyword}"？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteCommand(row);
  }).catch(() => {})
}

// 执行删除指令
const deleteCommand = (row) => {
  const index = allCommands.value.findIndex(item => item.id === row.id);
  if (index !== -1) {
    allCommands.value.splice(index, 1);
    ElMessage.success('指令删除成功');
  }
}

// 页面加载时执行
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.command-management-container {
  padding: 20px;
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

.info-card {
  margin-bottom: 16px;
  background-color: #f8f8f8;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-header h3 {
  margin: 0;
  font-size: 16px;
  color: #409EFF;
}

.info-content {
  line-height: 1.6;
}

.info-content p {
  margin: 8px 0;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}
</style> 