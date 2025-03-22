<!-- 供应商管理/供应商通道管理 - 管理供应商支付通道 -->
<template>
  <div class="supplier-channel">
    <!-- 供应商信息 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="card-header">
          <span>供应商信息</span>
          <el-tag type="success">合作中</el-tag>
        </div>
      </template>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="供应商名称" width="280">
          示例支付科技有限公司
        </el-descriptions-item>
        <el-descriptions-item label="供应商编码" width="200">
          S202403150001
        </el-descriptions-item>
        <el-descriptions-item label="供应商类型" width="200">
          <el-tag size="small" type="primary">支付机构</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="通道数量" width="200">
          <el-tag size="small" type="info">5</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系人">
          张三
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          13800138000
        </el-descriptions-item>
        <el-descriptions-item label="联系邮箱">
          zhangsan@example.com
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          2024-03-15 10:00:00
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 搜索卡片 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="通道名称">
          <el-input v-model="searchForm.channelName" placeholder="请输入通道名称" clearable />
        </el-form-item>
        <el-form-item label="支付类型">
          <el-select v-model="searchForm.payType" placeholder="请选择" clearable style="width: 168px">
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="微信" value="WECHAT" />
            <el-option label="银联" value="UNIONPAY" />
          </el-select>
        </el-form-item>
        <el-form-item label="通道状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px">
            <el-option label="正常" value="ACTIVE" />
            <el-option label="维护中" value="MAINTENANCE" />
            <el-option label="已关闭" value="CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 通道列表 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>通道列表</span>
          <div class="right">
            <el-button type="primary" :icon="Plus" @click="handleAdd">新增通道</el-button>
            <el-button type="success" :icon="Download" @click="handleExport">导出Excel</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="channelCode" label="通道编码" width="120" />
        <el-table-column prop="channelName" label="通道名称" width="180" />
        <el-table-column prop="payType" label="支付方式" width="120">
          <template #default="scope">
            <el-tag :type="getPayTypeType(scope.row.payType)">
              {{ getPayTypeText(scope.row.payType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rate" label="费率" width="120">
          <template #default="scope">
            {{ scope.row.rate }}%
          </template>
        </el-table-column>
        <el-table-column prop="minAmount" label="单笔最小(元)" width="120">
          <template #default="scope">
            ¥ {{ scope.row.minAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="maxAmount" label="单笔最大(元)" width="120">
          <template #default="scope">
            ¥ {{ scope.row.maxAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="dailyLimit" label="日交易限额(元)" width="120">
          <template #default="scope">
            ¥ {{ scope.row.dailyLimit.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="通道状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button
              v-if="scope.row.status === 'active'"
              type="danger"
              link
              :icon="TakeawayBox"
              @click="handleDisable(scope.row)"
            >
              禁用
            </el-button>
            <el-button
              v-if="scope.row.status === 'disabled'"
              type="success"
              link
              :icon="Sell"
              @click="handleEnable(scope.row)"
            >
              启用
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">
              删除
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

    <!-- 表单对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="formType === 'add' ? '新增通道' : '编辑通道'"
      width="500px"
    >
      <el-form :model="channelForm" label-width="100px">
        <el-form-item label="通道名称">
          <el-input v-model="channelForm.channelName" placeholder="请输入通道名称" />
        </el-form-item>
        <el-form-item label="支付类型">
          <el-select v-model="channelForm.payType" placeholder="请选择" style="width: 100%">
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="微信" value="WECHAT" />
            <el-option label="银联" value="UNIONPAY" />
          </el-select>
        </el-form-item>
        <el-form-item label="费率">
          <el-input-number
            v-model="channelForm.rate"
            :min="0"
            :max="1"
            :precision="4"
            :step="0.0001"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="单笔最小">
          <el-input-number
            v-model="channelForm.minAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="单笔最大">
          <el-input-number
            v-model="channelForm.maxAmount"
            :min="channelForm.minAmount"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="日限额">
          <el-input-number
            v-model="channelForm.dailyLimit"
            :min="channelForm.maxAmount"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="channelForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleFormSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus, Download, Edit, Delete, TakeawayBox, Sell, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'

const route = useRoute()
const supplierNo = route.query.supplierNo

const searchForm = reactive({
  channelName: '',
  payType: '',
  status: ''
})

const tableData = ref([
  {
    channelCode: 'C202403150001',
    channelName: '微信支付通道',
    payType: 'wechat',
    rate: 0.6,
    minAmount: 0.01,
    maxAmount: 50000.00,
    dailyLimit: 1000000.00,
    status: 'active',
    createTime: '2024-03-15 10:00:00'
  },
  {
    channelCode: 'C202403150002',
    channelName: '支付宝通道',
    payType: 'alipay',
    rate: 0.55,
    minAmount: 0.01,
    maxAmount: 100000.00,
    dailyLimit: 2000000.00,
    status: 'disabled',
    createTime: '2024-03-15 11:00:00'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const formDialogVisible = ref(false)
const formType = ref('add')
const channelForm = reactive({
  channelName: '',
  payType: '',
  rate: 0,
  minAmount: 0,
  maxAmount: 0,
  dailyLimit: 0,
  remark: ''
})

const handleSearch = () => {
  // TODO: 实现搜索逻辑
  console.log('搜索条件：', searchForm)
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

const handleAdd = () => {
  formType.value = 'add'
  Object.keys(channelForm).forEach(key => {
    channelForm[key] = key === 'rate' ? 0 : key.includes('Amount') || key === 'dailyLimit' ? 0 : ''
  })
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  formType.value = 'edit'
  Object.keys(channelForm).forEach(key => {
    channelForm[key] = row[key] || ''
  })
  formDialogVisible.value = true
}

const handleFormSubmit = () => {
  if (!channelForm.channelName || !channelForm.payType) {
    ElMessage.warning('请填写完整的通道信息')
    return
  }

  if (channelForm.maxAmount < channelForm.minAmount) {
    ElMessage.warning('单笔最大金额不能小于最小金额')
    return
  }

  if (channelForm.dailyLimit < channelForm.maxAmount) {
    ElMessage.warning('日限额不能小于单笔最大金额')
    return
  }

  // TODO: 实现表单提交逻辑
  ElMessage.success(formType.value === 'add' ? '添加成功' : '修改成功')
  formDialogVisible.value = false
}

const handleDisable = (row) => {
  ElMessageBox.confirm(
    '确认要禁用该通道吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    console.log('禁用通道：', row)
    ElMessage.success('通道已禁用')
  }).catch(() => {})
}

const handleEnable = (row) => {
  ElMessageBox.confirm(
    '确认要启用该通道吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    console.log('启用通道：', row)
    ElMessage.success('通道已启用')
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确认要删除该通道吗？删除后将无法恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    console.log('删除通道：', row)
    ElMessage.success('通道已删除')
  }).catch(() => {})
}

const handleSizeChange = (val) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // TODO: 重新加载数据
}

const handleExport = () => {
  ElMessage.success('通道数据导出成功')
}

// 支付方式映射
const getPayTypeType = (type) => {
  const map = {
    wechat: 'success',
    alipay: 'primary',
    union: 'warning',
    bank: 'info'
  }
  return map[type]
}

const getPayTypeText = (type) => {
  const map = {
    wechat: '微信支付',
    alipay: '支付宝',
    union: '银联',
    bank: '网银'
  }
  return map[type]
}

// 状态映射
const getStatusType = (status) => {
  const map = {
    active: 'success',
    disabled: 'info',
    error: 'danger'
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    active: '正常',
    disabled: '已禁用',
    error: '异常'
  }
  return map[status]
}
</script>

<style scoped>
.supplier-channel {
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

.right {
  display: flex;
  gap: 12px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.search-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 