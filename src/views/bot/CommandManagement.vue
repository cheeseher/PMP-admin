<!-- 机器人管理/指令管理 - 配置可分配给群组的指令 -->
<template>
  <div class="command-management-container">


    <!-- 筛选表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="filterForm" inline class="filter-form">
        <div class="filter-row">
          <!-- 预设指令tab显示的筛选字段 -->
          <template v-if="activeTab === 'default'">
            <el-form-item label="指令名称：">
              <el-input 
                v-model="filterForm.keyword" 
                placeholder="请输入指令名称" 
                clearable 
                style="width: 180px"
              />
            </el-form-item>
          </template>
          
          <!-- 自定义指令tab显示的筛选字段 -->
          <template v-else>
            <el-form-item label="指令名称：">
              <el-input 
                v-model="filterForm.keyword" 
                placeholder="请输入指令名称" 
                clearable 
                style="width: 180px"
              />
            </el-form-item>
          </template>
          
          <!-- 两个tab页共用的筛选字段 -->
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
            <div class="left" style="display: flex; align-items: center; gap: 10px;">
              <el-button type="primary" :icon="Setting" @click="openOrderQuerySettingDrawer">查单按钮设置</el-button>
              <el-alert
                type="info"
                show-icon
                :closable="false"
                style="margin: 0; padding: 0 16px; line-height: 30px; height: 32px; box-sizing: border-box;"
              >
                <template #title>
                  <span style="line-height: 32px;">预设指令为系统内置指令，不支持新增，仅可编辑状态</span>
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
            <el-table-column prop="keyword" label="指令名称" min-width="120" />
            <el-table-column prop="format" label="指令格式" min-width="160" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" effect="plain">
                  {{ row.status === 'enabled' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="180" align="center">
              <template #default="{ row }">
                <el-button type="primary" link @click="openCommandDialog('edit', row.type, row)">
                  编辑
                </el-button>
                <!-- 删除预设指令表格中的删除按钮 -->
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
            <el-table-column prop="keyword" label="指令名称" min-width="120" />
            <el-table-column prop="responseTemplate" label="回复内容" min-width="200" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" effect="plain">
                  {{ row.status === 'enabled' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="180" align="center">
              <template #default="{ row }">
                <el-button type="primary" link @click="openCommandDialog('edit', row.type, row)">
                  编辑
                </el-button>
                <el-button type="danger" link @click="handleDelete(row)">
                  删除
                </el-button>
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
        <!-- 预设指令和自定义指令共有的字段 -->
        <el-form-item label="指令名称" prop="keyword">
          <el-input 
            v-model="commandForm.keyword" 
            placeholder="请输入指令名称，如：ye"
            :readonly="dialogType === 'edit' && commandForm.type === 'default'"
          />
        </el-form-item>
        <!-- 预设指令特有的字段 -->
        <el-form-item v-if="commandForm.type === 'default'" label="指令格式" prop="format">
          <el-input 
            v-model="commandForm.format" 
            placeholder="请输入指令格式，如：ye#商户名"
            :readonly="dialogType === 'edit' && commandForm.type === 'default'"
          />
        </el-form-item>
        <!-- 自定义指令特有的字段 -->
        <el-form-item v-if="commandForm.type === 'other'" label="回复内容" prop="responseTemplate">
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
        <!-- 删除预设指令的响应模板字段 -->
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
    
    <!-- 查单按钮设置抽屉 -->
    <el-drawer
      v-model="orderQuerySettingDrawerVisible"
      title="查单按钮设置"
      direction="rtl"
      size="50%"
      destroy-on-close
    >
      <div class="drawer-container">
        <div class="drawer-toolbar">
          <el-button type="primary" :icon="Plus" @click="addButton">新增按钮</el-button>
        </div>
        <el-table :data="orderQueryButtons" border style="width: 100%">
          <el-table-column label="按钮名称" width="150">
            <template #default="{ row }">
              <el-input 
                v-model="row.name" 
                placeholder="请输入按钮名称" 
                :disabled="row.isDefault || !row.isNew" 
              />
            </template>
          </el-table-column>
          <el-table-column label="按钮顺序" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.order" :min="1" controls-position="right" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="按钮文字">
            <template #default="{ row }">
              <el-input v-model="row.text" placeholder="请输入按钮文字" />
            </template>
          </el-table-column>
          <el-table-column label="按钮回复">
            <template #default="{ row }">
              <el-input v-model="row.reply" type="textarea" :rows="2" placeholder="请输入点击按钮后的回复内容" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ row, $index }">
              <el-button 
                type="danger" 
                link 
                @click="removeButton($index)"
                :disabled="row.isDefault"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="orderQuerySettingDrawerVisible = false">取消</el-button>
          <el-button type="primary" @click="saveOrderQuerySetting">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, ArrowDown, Setting } from '@element-plus/icons-vue'

// 显示信息卡片
// 移除了说明卡片

// 标签页相关
const activeTab = ref('default');

// 筛选表单
const filterForm = reactive({
  keyword: '',
  format: '',
  responseContent: '',
  status: ''
})

// 表格数据
const allCommands = ref([
  {
    id: 1,
    keyword: '查询商户余额',
    format: 'ye',
    responseTemplate: '商户 {{merchantName}} 的当前余额为：¥{{balance}}',
    requiresBinding: true,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 2,
    keyword: '查单',
    format: '截图+商户单号',
    responseTemplate: '订单号：{{orderId}}\n订单状态：{{orderStatus}}\n订单金额：¥{{amount}}\n创建时间：{{createTime}}\n完成时间：{{completeTime}}',
    requiresBinding: true,
    status: 'enabled',
    type: 'default', // 预设指令
    buttonConfig: [
      { id: 'default-callback', order: 1, name: '回调按钮', text: '成功', reply: '默认', isDefault: true },
      { id: 1, order: 2, name: '补单按钮', text: '已补单', reply: '当前订单已补单！' },
      { id: 2, order: 3, name: '未付款按钮', text: '未付款', reply: '当前订单未付款，请您检查' },
    ]
  },
  {
    id: 3,
    keyword: '绑定商户',
    format: 'bdsh#商户名称',
    responseTemplate: '商户 {{merchantName}} 绑定成功！',
    requiresBinding: false,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 4,
    keyword: '解绑商户',
    format: 'jcbdsh',
    responseTemplate: '商户 {{merchantName}} 解绑成功！',
    requiresBinding: true,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 5,
    keyword: '商户余额增加',
    format: '商户余额#商户名称#+金额',
    responseTemplate: '商户 {{merchantName}} 余额已增加 ¥{{amount}}，当前余额：¥{{balance}}',
    requiresBinding: true,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 6,
    keyword: '商户余额扣减',
    format: '商户余额#商户名称#-金额',
    responseTemplate: '商户 {{merchantName}} 余额已扣减 ¥{{amount}}，当前余额：¥{{balance}}',
    requiresBinding: true,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 7,
    keyword: '加白',
    format: '加白#商户名称#IP1,IP2,...',
    responseTemplate: 'IP {{ip}} 已添加到白名单',
    requiresBinding: false,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 8,
    keyword: '商户费率',
    format: '商户费率',
    responseTemplate: '商户 {{merchantName}} 的 {{productType}} 费率为：{{rate}}%',
    requiresBinding: true,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 9,
    keyword: '通道费率',
    format: '通道费率',
    responseTemplate: '通道 {{channelName}} 的 {{productType}} 费率为：{{rate}}%',
    requiresBinding: false,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 10,
    keyword: '绑定渠道',
    format: 'bdqd#渠道名称',
    responseTemplate: '渠道 {{channelName}} 绑定成功！',
    requiresBinding: false,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 11,
    keyword: '解绑渠道',
    format: 'jcbdqd',
    responseTemplate: '渠道 {{channelName}} 解绑成功！',
    requiresBinding: true,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 12,
    keyword: '查询ID',
    format: 'id',
    responseTemplate: '用户 {{username}} 的ID为：{{userId}}',
    requiresBinding: false,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 13,
    keyword: '查询群ID',
    format: '群ID/chat_id',
    responseTemplate: '当前群ID为：{{groupId}}',
    requiresBinding: false,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 14,
    keyword: '渠道余额增加',
    format: '渠道余额#渠道名称#+金额',
    responseTemplate: '渠道 {{channelName}} 余额已增加 ¥{{amount}}，当前余额：¥{{balance}}',
    requiresBinding: true,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 15,
    keyword: '渠道余额扣减',
    format: '渠道余额#渠道名称#-金额',
    responseTemplate: '渠道 {{channelName}} 余额已扣减 ¥{{amount}}，当前余额：¥{{balance}}',
    requiresBinding: true,
    status: 'enabled',
    type: 'default' // 预设指令
  },
  {
    id: 16,
    keyword: '商户使用说明',
    format: '商户使用说明',
    responseTemplate: '使用说明：\n1. 绑定商户：输入"绑定商户#商户ID#密钥"\n2. 查询余额：输入"查询商户余额#商户ID"\n3. 查单：输入"查单#订单号"\n4. 如需帮助请联系客服',
    requiresBinding: false,
    status: 'enabled',
    type: 'other' // 自定义指令
  },
  {
    id: 17,
    keyword: '210规则',
    format: '210规则',
    responseTemplate: '210规则说明：\n1. 充值2万，赠送1万，共3万\n2. 充值5万，赠送3万，共8万\n3. 充值10万，赠送8万，共18万\n4. 活动时间：2023年10月1日-2023年12月31日',
    requiresBinding: false,
    status: 'enabled',
    type: 'other' // 自定义指令
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
    
    // 所有指令只检查关键词和状态
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
    { required: true, message: '请输入指令名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  format: [
    { required: true, message: '请输入指令格式', trigger: 'blur' }
  ],
  responseTemplate: [
    { required: true, message: '请输入回复内容', trigger: 'blur' }
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
  filterForm.format = ''
  filterForm.responseContent = ''
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

// 查单按钮设置抽屉
const orderQuerySettingDrawerVisible = ref(false)
const orderQueryButtons = ref([])

// 打开查单按钮设置抽屉
const openOrderQuerySettingDrawer = () => {
  const orderQueryCommand = allCommands.value.find(cmd => cmd.keyword === '查单' && cmd.type === 'default');
  if (orderQueryCommand && orderQueryCommand.buttonConfig) {
    // 深拷贝，避免直接修改源数据
    orderQueryButtons.value = JSON.parse(JSON.stringify(orderQueryCommand.buttonConfig));
  } else {
    orderQueryButtons.value = [];
  }
  
  // 确保始终有一个默认的回调按钮
  const hasDefaultButton = orderQueryButtons.value.some(btn => btn.isDefault);
  if (!hasDefaultButton) {
    orderQueryButtons.value.unshift({
      id: 'default-callback',
      name: '回调按钮',
      order: 1,
      text: '成功',
      reply: '默认',
      isDefault: true, // 标识为默认按钮，不允许删除
      isNew: false
    });
    // 调整其他按钮的顺序
    orderQueryButtons.value.forEach((btn, index) => {
      if (!btn.isDefault) {
        btn.order = index + 1;
      }
    });
  }
  
  orderQuerySettingDrawerVisible.value = true;
}

// 新增按钮
const addButton = () => {
  orderQueryButtons.value.push({
    id: Date.now(),
    name: '',
    order: orderQueryButtons.value.length + 1,
    text: '',
    reply: '',
    isNew: true // 标识为新增按钮
  });
}

// 删除按钮
const removeButton = (index) => {
  const button = orderQueryButtons.value[index];
  if (button.isDefault) {
    ElMessage.warning('默认按钮不允许删除');
    return;
  }
  orderQueryButtons.value.splice(index, 1);
}

// 保存查单按钮设置
const saveOrderQuerySetting = () => {
  // 校验输入框是否为空
  const hasEmptyFields = orderQueryButtons.value.some(btn => 
    !btn.name || btn.name.trim() === '' ||
    !btn.text || btn.text.trim() === '' ||
    !btn.reply || btn.reply.trim() === ''
  );
  if (hasEmptyFields) {
    ElMessage.error('输入框不能为空');
    return;
  }
  
  // 校验顺序号是否重复
  const orders = orderQueryButtons.value.map(btn => btn.order);
  const hasDuplicates = new Set(orders).size !== orders.length;

  if (hasDuplicates) {
    ElMessage.error('按钮顺序不能重复，请修改后保存');
    return;
  }
  
  // 校验按钮名称是否重复
  const names = orderQueryButtons.value.map(btn => btn.name);
  const hasDuplicateNames = new Set(names).size !== names.length;
  
  if (hasDuplicateNames) {
    ElMessage.error('按钮名称不能重复，请修改后保存');
    return;
  }

  const index = allCommands.value.findIndex(cmd => cmd.keyword === '查单' && cmd.type === 'default');
  if (index !== -1) {
    // 移除isNew标识，保留isDefault标识，保存排序后的按钮
    const buttonsToSave = orderQueryButtons.value.map(btn => {
      const { isNew, ...buttonData } = btn;
      return buttonData;
    });
    allCommands.value[index].buttonConfig = buttonsToSave.sort((a, b) => a.order - b.order);
    ElMessage.success('查单按钮设置已保存');
    orderQuerySettingDrawerVisible.value = false;
  } else {
    ElMessage.error('未找到"查单"指令，保存失败');
  }
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

.drawer-container {
  padding: 0 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-toolbar {
  margin-bottom: 16px;
}
</style>