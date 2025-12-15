<template>
  <div class="page-container">
    <!-- 筛选区 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="代理商ID">
            <el-input v-model="filterForm.agentId" placeholder="请输入代理商ID" style="width: 168px" />
          </el-form-item>
          <el-form-item label="账号">
            <el-input v-model="filterForm.username" placeholder="请输入账号" style="width: 168px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="请选择状态" style="width: 168px">
              <el-option label="全部" value="" />
              <el-option label="正常" value="active" />
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
      <el-button type="primary" @click="handleAdd">新增代理商</el-button>
      <el-button @click="handleExport">导出</el-button>
    </div>

    <!-- 表格展示 -->
    <el-table :data="tableData" border stripe v-loading="loading">
      <el-table-column prop="agentId" label="代理商 ID" width="100" fixed />
      <el-table-column prop="username" label="账号" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="parentAgent" label="上级" width="120" />
      <el-table-column prop="subAccountCount" label="子账户数量" width="100" align="center" />
      <el-table-column prop="merchantCount" label="商户数量" width="100" align="center" />
      <el-table-column prop="balance" label="余额" width="120" align="right" />
      <el-table-column prop="availableBalance" label="可用" width="120" align="right" />
      <el-table-column prop="frozenBalance" label="冻结" width="120" align="right" />
      <el-table-column prop="rate" label="费率" width="100" align="right" />
      <el-table-column prop="lastLoginIp" label="上次登录 IP" width="140" />
      <el-table-column prop="loginCount" label="登录次数" width="100" align="center" />
      <el-table-column prop="googleAuth" label="谷歌认证" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.googleAuth ? 'success' : 'info'">{{ scope.row.googleAuth ? '已开启' : '未开启' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="oneClickLogin" label="一键登录" width="100" align="center">
        <template #default="scope">
          <el-switch v-model="scope.row.oneClickLogin" disabled />
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="120" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
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
      width="600px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="上级代理">
          <el-select v-model="form.parentAgent" placeholder="请选择上级代理" style="width: 100%">
            <el-option label="无" value="-" />
            <el-option label="代理商A" value="代理商A" />
          </el-select>
        </el-form-item>
        <el-form-item label="费率">
          <el-input v-model="form.rate" placeholder="请输入费率" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="总代理" value="总代理" />
            <el-option label="普通代理" value="普通代理" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="active">正常</el-radio>
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
import { agentList } from '@/data/agentData.js'

// 筛选表单
const filterForm = reactive({
  agentId: '',
  username: '',
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
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' or 'edit'
const form = reactive({
  username: '',
  nickname: '',
  parentAgent: '',
  rate: '',
  role: '',
  status: 'active'
})

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
  dialogVisible.value = false
  // 模拟保存
  fetchData()
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
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
