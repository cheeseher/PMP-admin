<!-- 供应商管理/供应商列表 - 管理支付供应商信息 -->
<template>
  <div class="supplier-list">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>供应商总数</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">56</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                2
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>活跃供应商</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">42</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                1
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日交易额</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥ 2,586,432.00</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                15.2%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日订单数</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">3,268</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                12.5%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索表单 -->
    <el-card shadow="never" class="mb-4">
      <el-form :model="searchForm" label-width="120px" inline>
        <el-form-item label="供应商编号">
          <el-input v-model="searchForm.supplierNo" placeholder="请输入供应商编号" clearable />
        </el-form-item>
        <el-form-item label="供应商名称">
          <el-input v-model="searchForm.supplierName" placeholder="请输入供应商名称" clearable />
        </el-form-item>
        <el-form-item label="供应商状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px">
            <el-option label="正常" value="ACTIVE" />
            <el-option label="冻结" value="FROZEN" />
            <el-option label="禁用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>供应商列表</span>
          <div class="right">
            <el-button type="primary" :icon="Plus" @click="handleAdd">新增供应商</el-button>
            <el-button type="success" :icon="Download" @click="handleExport">导出Excel</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="supplierNo" label="供应商编号" width="180" />
        <el-table-column prop="supplierName" label="供应商名称" width="180" />
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="120" />
        <el-table-column prop="balance" label="账户余额" width="120">
          <template #default="scope">
            ¥{{ scope.row.balance.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === 'ACTIVE' ? 'success' :
                scope.row.status === 'FROZEN' ? 'warning' : 'danger'
              "
            >
              {{ 
                scope.row.status === 'ACTIVE' ? '正常' :
                scope.row.status === 'FROZEN' ? '冻结' : '禁用'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="View" @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="primary" link :icon="Setting" @click="handleChannel(scope.row)">
              通道
            </el-button>
            <el-button 
              v-if="scope.row.status === 'ACTIVE'"
              type="warning" 
              link 
              @click="handleFreeze(scope.row)"
            >
              冻结
            </el-button>
            <el-button 
              v-if="scope.row.status === 'FROZEN'"
              type="success" 
              link 
              @click="handleUnfreeze(scope.row)"
            >
              解冻
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="formDialogVisible"
      :title="formType === 'add' ? '新增供应商' : '编辑供应商'"
      width="600px"
    >
      <el-form :model="supplierForm" label-width="100px">
        <el-form-item label="供应商名称">
          <el-input v-model="supplierForm.supplierName" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="supplierForm.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="supplierForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="结算银行">
          <el-input v-model="supplierForm.bankName" placeholder="请输入开户银行" />
        </el-form-item>
        <el-form-item label="银行账号">
          <el-input v-model="supplierForm.bankAccount" placeholder="请输入银行账号" />
        </el-form-item>
        <el-form-item label="开户名">
          <el-input v-model="supplierForm.accountName" placeholder="请输入开户名" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="supplierForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleFormSubmit">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, Download, View, Edit, Delete, Plus, Setting, ArrowUp } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索表单数据
const searchForm = reactive({
  supplierNo: '',
  supplierName: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    supplierNo: 'S202403220001',
    supplierName: '测试供应商1',
    contactName: '张三',
    contactPhone: '13800138001',
    balance: 100000.00,
    status: 'ACTIVE',
    createTime: '2024-03-22 10:00:00',
    remark: '主要供应商'
  },
  {
    supplierNo: 'S202403220002',
    supplierName: '测试供应商2',
    contactName: '李四',
    contactPhone: '13800138002',
    balance: 50000.00,
    status: 'FROZEN',
    createTime: '2024-03-22 10:02:00',
    remark: '风控审核中'
  },
  {
    supplierNo: 'S202403220003',
    supplierName: '测试供应商3',
    contactName: '王五',
    contactPhone: '13800138003',
    balance: 0.00,
    status: 'DISABLED',
    createTime: '2024-03-22 10:03:00',
    remark: '长期无交易'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

const formDialogVisible = ref(false)
const formType = ref('add')
const supplierForm = reactive({
  supplierName: '',
  contactName: '',
  contactPhone: '',
  bankName: '',
  bankAccount: '',
  accountName: '',
  remark: ''
})

// 供应商类型映射
const getTypeType = (type) => {
  const map = {
    payment: 'primary',
    bank: 'success',
    third: 'warning'
  }
  return map[type]
}

const getTypeText = (type) => {
  const map = {
    payment: '支付机构',
    bank: '银行',
    third: '第三方'
  }
  return map[type]
}

// 状态映射
const getStatusType = (status) => {
  const map = {
    active: 'success',
    terminated: 'info',
    pending: 'warning',
    rejected: 'danger'
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    active: '合作中',
    terminated: '已终止',
    pending: '待审核',
    rejected: '已驳回'
  }
  return map[status]
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.dateRange = []
}

// 导出
const handleExport = () => {
  ElMessage.success('供应商数据导出成功')
}

// 新增供应商
const handleAdd = () => {
  formType.value = 'add'
  Object.keys(supplierForm).forEach(key => {
    supplierForm[key] = ''
  })
  formDialogVisible.value = true
}

// 查看供应商
const handleView = (row) => {
  router.push({
    name: 'SupplierDetail',
    query: { id: row.supplierNo }
  })
}

// 编辑供应商
const handleEdit = (row) => {
  formType.value = 'edit'
  Object.keys(supplierForm).forEach(key => {
    supplierForm[key] = row[key] || ''
  })
  formDialogVisible.value = true
}

// 管理通道
const handleChannel = (row) => {
  router.push({
    name: 'SupplierChannel',
    query: { supplierNo: row.supplierNo }
  })
}

// 冻结供应商
const handleFreeze = (row) => {
  ElMessageBox.confirm(
    `确认要冻结供应商 ${row.supplierName} 吗？`,
    '冻结确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现冻结逻辑
    ElMessage.success('冻结成功')
  }).catch(() => {})
}

// 解冻供应商
const handleUnfreeze = (row) => {
  ElMessageBox.confirm(
    `确认要解冻供应商 ${row.supplierName} 吗？`,
    '解冻确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现解冻逻辑
    ElMessage.success('解冻成功')
  }).catch(() => {})
}

// 表单提交
const handleFormSubmit = () => {
  // TODO: 实现表单提交逻辑
  ElMessage.success(formType.value === 'add' ? '添加成功' : '修改成功')
  formDialogVisible.value = false
}

// 分页事件处理
const handleSizeChange = (val) => {
  console.log('每页条数:', val)
}

const handleCurrentChange = (val) => {
  console.log('当前页:', val)
}
</script>

<style scoped>
.supplier-list {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.amount {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.trend {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 12px;
  color: #909399;
}

.right {
  display: flex;
  gap: 12px;
}

.supplier-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.supplier-logo {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 