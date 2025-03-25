<!-- 系统管理/管理员业务日志 - 记录管理员业务操作 -->
<template>
  <div class="business-log-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="操作者：">
            <el-input v-model="searchForm.operator" placeholder="请输入操作者" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="业务类型：">
            <el-select v-model="searchForm.businessType" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部类型" value="" />
              <el-option label="商户充值" value="merchant_recharge" />
              <el-option label="商户提现" value="merchant_withdraw" />
              <el-option label="订单补单" value="order_supplement" />
              <el-option label="费率调整" value="rate_adjust" />
              <el-option label="商户注册" value="merchant_register" />
              <el-option label="余额调整" value="balance_adjust" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作状态：">
            <el-select v-model="searchForm.status" placeholder="请选择" style="width: 168px" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="fail" />
            </el-select>
          </el-form-item>
          <el-form-item label="业务对象：">
            <el-input v-model="searchForm.businessObject" placeholder="请输入业务对象" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="操作日期：">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 360px"
            />
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
          <span class="table-title">业务日志列表</span>
          <el-tag type="info" size="small" effect="plain">{{ pagination.total }}条记录</el-tag>
        </div>
        <div class="right">
          <el-button type="danger" :icon="Delete" @click="handleClear">清空日志</el-button>
          <el-button :icon="Download" plain @click="handleExport">导出日志</el-button>
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
      >
        <el-table-column prop="id" label="序号" width="80" />
        <el-table-column prop="businessModule" label="业务模块" width="120" />
        <el-table-column prop="businessType" label="业务类型" width="120">
          <template #default="scope">
            <el-tag 
              :type="getBusinessTypeTag(scope.row.businessType)" 
              size="small"
            >
              {{ getBusinessTypeText(scope.row.businessType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="businessObject" label="业务对象" width="120" />
        <el-table-column prop="description" label="业务描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="operationUser" label="操作人" width="120" />
        <el-table-column prop="operationRole" label="操作角色" width="120" />
        <el-table-column prop="beforeValue" label="操作前数据" width="120" show-overflow-tooltip />
        <el-table-column prop="afterValue" label="操作后数据" width="120" show-overflow-tooltip />
        <el-table-column prop="status" label="操作状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="操作时间" width="160" />
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleView(scope.row)">详情</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, Delete, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  operator: '',
  businessType: '',
  status: '',
  businessObject: '',
  dateRange: []
})

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    id: 1,
    businessModule: '订单管理',
    businessType: 'merchant_recharge',
    businessObject: '商户ID:10001',
    description: '为商户充值10000元',
    operationUser: 'admin',
    operationRole: '超级管理员',
    beforeValue: '余额:5000.00',
    afterValue: '余额:15000.00',
    status: 'success',
    operationTime: '2025-03-24 10:00:00'
  },
  {
    id: 2,
    businessModule: '订单管理',
    businessType: 'merchant_withdraw',
    businessObject: '商户ID:10002',
    description: '商户提现5000元',
    operationUser: 'admin',
    operationRole: '超级管理员',
    beforeValue: '余额:8000.00',
    afterValue: '余额:3000.00',
    status: 'success',
    operationTime: '2025-03-24 11:15:30'
  },
  {
    id: 3,
    businessModule: '订单管理',
    businessType: 'order_supplement',
    businessObject: '订单号:202503241125',
    description: '为订单手动补单',
    operationUser: 'operator',
    operationRole: '运营管理员',
    beforeValue: '状态:未支付',
    afterValue: '状态:已支付',
    status: 'success',
    operationTime: '2025-03-24 12:30:15'
  },
  {
    id: 4,
    businessModule: '商户管理',
    businessType: 'rate_adjust',
    businessObject: '商户ID:10003',
    description: '调整商户费率',
    operationUser: 'admin',
    operationRole: '超级管理员',
    beforeValue: '费率:0.6%',
    afterValue: '费率:0.55%',
    status: 'success',
    operationTime: '2025-03-24 14:05:20'
  },
  {
    id: 5,
    businessModule: '商户管理',
    businessType: 'balance_adjust',
    businessObject: '商户ID:10004',
    description: '手动调整商户余额',
    operationUser: 'finance',
    operationRole: '财务管理员',
    beforeValue: '余额:2000.00',
    afterValue: '余额:2500.00',
    status: 'success',
    operationTime: '2025-03-24 15:20:45'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 86
})

// 业务类型映射
const getBusinessTypeTag = (type) => {
  const map = {
    merchant_recharge: 'success',
    merchant_withdraw: 'warning',
    order_supplement: 'info',
    rate_adjust: 'primary',
    merchant_register: 'success',
    balance_adjust: 'warning'
  }
  return map[type] || 'info'
}

const getBusinessTypeText = (type) => {
  const map = {
    merchant_recharge: '商户充值',
    merchant_withdraw: '商户提现',
    order_supplement: '订单补单',
    rate_adjust: '费率调整',
    merchant_register: '商户注册',
    balance_adjust: '余额调整'
  }
  return map[type] || type
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  ElMessage.success('搜索条件已提交')
}

// 重置搜索条件
const handleReset = () => {
  Object.assign(searchForm, {
    operator: '',
    businessType: '',
    status: '',
    businessObject: '',
    dateRange: []
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

// 导出日志
const handleExport = () => {
  ElMessage.success('日志导出中，请稍后...')
}

// 清空日志
const handleClear = () => {
  ElMessageBox.confirm(
    '确定要清空所有业务日志吗？此操作不可恢复！', 
    '警告', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    ElMessage.success('业务日志已清空')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 查看详情
const handleView = (row) => {
  ElMessageBox.alert(
    `<strong>操作ID：</strong>${row.id}<br>
    <strong>业务模块：</strong>${row.businessModule}<br>
    <strong>业务类型：</strong>${getBusinessTypeText(row.businessType)}<br>
    <strong>业务对象：</strong>${row.businessObject}<br>
    <strong>业务描述：</strong>${row.description}<br>
    <strong>操作人：</strong>${row.operationUser}<br>
    <strong>操作角色：</strong>${row.operationRole}<br>
    <strong>操作前数据：</strong>${row.beforeValue}<br>
    <strong>操作后数据：</strong>${row.afterValue}<br>
    <strong>操作状态：</strong>${row.status === 'success' ? '成功' : '失败'}<br>
    <strong>操作时间：</strong>${row.operationTime}<br>`, 
    '业务日志详情', 
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
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
.business-log-container {
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
</style> 