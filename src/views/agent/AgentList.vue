<template>
  <div class="page-container">
    <!-- 筛选区 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="ID：">
            <el-input v-model="filterForm.agentId" placeholder="请输入代理商ID" style="width: 168px" />
          </el-form-item>
          <el-form-item label="代理商账号：">
            <el-input v-model="filterForm.username" placeholder="请输入代理商账号" style="width: 168px" />
          </el-form-item>
          <el-form-item label="代理商名称：">
            <el-input v-model="filterForm.agentName" placeholder="请输入代理商名称" style="width: 168px" />
          </el-form-item>
          <el-form-item label="启用状态：">
            <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 168px">
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
          <div class="filter-buttons">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="table-toolbar">
      <div class="left">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增代理商</el-button>
      </div>
      <div class="right">
        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
        <el-tooltip content="刷新数据">
          <el-button :icon="Refresh" circle plain @click="fetchData" />
        </el-tooltip>
      </div>
    </div>

    <!-- 表格展示 -->
    <el-table :data="tableData" border stripe v-loading="loading">
      <el-table-column prop="agentId" label="ID" width="100" />
      <el-table-column prop="username" label="代理商账号" width="120" />
      <el-table-column prop="agentName" label="代理商名称" width="120" />
      <el-table-column prop="parentAgent" label="上级" width="120" align="center" />
      <el-table-column prop="subAccountCount" label="子账户数量" width="120" align="center" />
      <el-table-column prop="merchantCount" label="商户数量" width="100" align="center" />
      <el-table-column prop="balance" label="代理商余额" width="130" align="right">
        <template #default="{ row }">
          {{ Number(row.balance).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="availableBalance" label="可用余额" width="130" align="right">
        <template #default="{ row }">
          {{ Number(row.availableBalance).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="frozenBalance" label="冻结余额" width="120" align="right">
        <template #default="{ row }">
          {{ Number(row.frozenBalance).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="rate" label="代理商费率" width="120" align="right" />
      <el-table-column prop="lastLoginIp" label="上次登录 IP" width="140" align="center" />
      <el-table-column prop="loginCount" label="登录次数" width="100" align="center" />
      <el-table-column prop="googleAuth" label="谷歌验证" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.googleAuth ? 'success' : 'info'">{{ scope.row.googleAuth ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="一键登录" width="100" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="handleOneClickLogin(scope.row)">一键登录</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="100" align="center" />
      <el-table-column prop="status" label="启用状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑/新增弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增代理商' : '编辑代理商'"
      width="650px"
      destroy-on-close
    >
      <el-form 
        ref="formRef"
        :model="form" 
        :rules="rules"
        label-width="130px"
      >
        <el-form-item label="上级" prop="parentAgent">
          <el-select v-model="form.parentAgent" placeholder="请选择上级代理" style="width: 100%" clearable>
            <el-option label="总代理 (平台)" value="platform" />
            <el-option 
              v-for="agent in agentList" 
              :key="agent.agentId" 
              :label="agent.agentName" 
              :value="agent.agentName" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="代理商账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入代理商账号" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="代理商名称" prop="agentName">
          <el-input v-model="form.agentName" placeholder="请输入代理商名称" />
        </el-form-item>
        <el-form-item label="密码" :prop="dialogType === 'add' ? 'password' : ''">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="ACCESS KEY" prop="accessKey">
          <el-input v-model="form.accessKey" placeholder="请输入 ACCESS KEY">
            <template #append v-if="dialogType === 'add'">
              <el-button @click="form.accessKey = generateRandomKey(16)">自动生成</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="ACCESS SECRET" prop="accessSecret">
          <el-input v-model="form.accessSecret" placeholder="请输入 ACCESS SECRET">
            <template #append v-if="dialogType === 'add'">
              <el-button @click="form.accessSecret = generateRandomKey(32)">自动生成</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="回调通知 URL" prop="callbackUrl">
          <el-input v-model="form.callbackUrl" placeholder="请输入回调通知 URL" />
        </el-form-item>
        <el-form-item label="提现密码" prop="withdrawPassword">
          <el-input v-model="form.withdrawPassword" type="password" placeholder="请输入提现密码" show-password />
        </el-form-item>
        <el-form-item label="充值手续费费率" prop="depositFeeRate">
          <el-input v-model="form.depositFeeRate" placeholder="例如: 1.2%">
            <template #append>%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="IP 白名单" prop="ipWhitelist">
          <el-input 
            v-model="form.ipWhitelist" 
            type="textarea" 
            :rows="2" 
            placeholder="多个 IP 请用英文逗号分隔" 
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Download, Refresh } from '@element-plus/icons-vue'
import { agentList } from '@/data/agentData.js'

// 筛选表单
const filterForm = reactive({
  agentId: '',
  username: '',
  agentName: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 弹窗状态
const formRef = ref(null)
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' or 'edit'
const form = reactive({
  parentAgent: '',
  username: '',
  agentName: '',
  password: '',
  phone: '',
  accessKey: '',
  accessSecret: '',
  callbackUrl: '',
  withdrawPassword: '',
  depositFeeRate: '',
  ipWhitelist: '',
  remark: '',
  status: 'active'
})

// 表单验证规则
const rules = {
  parentAgent: [{ required: true, message: '请选择上级代理', trigger: 'change' }],
  username: [{ required: true, message: '请输入代理商账号', trigger: 'blur' }],
  agentName: [{ required: true, message: '请输入代理商名称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 初始化
onMounted(() => {
  fetchData()
})

const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = agentList
    loading.value = false
  }, 500)
}

// 搜索操作
const handleSearch = () => {
  fetchData()
}

const handleReset = () => {
  filterForm.agentId = ''
  filterForm.username = ''
  filterForm.agentName = ''
  filterForm.status = ''
  fetchData()
}

// 新增操作
const handleAdd = () => {
  dialogType.value = 'add'
  form.username = ''
  form.nickname = ''
  form.parentAgent = ''
  form.rate = ''
  form.role = ''
  form.status = 'active'
  dialogVisible.value = true
}

// 编辑操作
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 保存操作
const handleSave = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      dialogVisible.value = false
      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '编辑成功')
      fetchData()
    }
  })
}

// 随机字符串生成用于 KEY/SECRET
const generateRandomKey = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// 删除操作
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该代理商吗？', '提示', {
    type: 'warning'
  }).then(() => {
    // 模拟删除
    fetchData()
  })
}

// 查看操作
const handleView = (row) => {
  // 跳转详情页或弹窗
}

// 一键登录操作
const handleOneClickLogin = (row) => {
  console.log('一键登录:', row.agentName)
  // TODO: 实现跳转逻辑
}

// 导出操作
const handleExport = () => {
  // 模拟导出
}

// 分页操作
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchData()
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 0;
  display: flex;
  align-items: center;
}

.filter-form .el-form-item__label {
  line-height: 32px;
  white-space: nowrap;
  width: auto !important;
  padding-right: 6px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-toolbar .left,
.table-toolbar .right {
  display: flex;
  align-items: center;
}

.table-toolbar .right .el-button {
  margin-left: 12px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
