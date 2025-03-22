<!-- 商户管理/商户产品列表 - 管理商户的产品配置 -->
<template>
  <div class="merchant-products">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>产品总数</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">128</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                5
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>已上架产品</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">86</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="success" size="small">
                <el-icon><ArrowUp /></el-icon>
                3
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>产品类型</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">12</span>
            <div class="trend">
              <span class="label">较昨日</span>
              <el-tag type="info" size="small">
                <el-icon><Minus /></el-icon>
                0
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>产品收益</span>
              <el-tag type="success" size="small">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <span class="amount">¥ 158,600.00</span>
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
        <el-form-item label="商户名称">
          <el-input v-model="searchForm.merchantName" placeholder="请输入商户名称" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.productName" placeholder="请输入产品名称" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="产品编码">
          <el-input v-model="searchForm.productCode" placeholder="请输入产品编码" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="产品类型">
          <el-select v-model="searchForm.productType" placeholder="请选择类型" style="width: 168px" clearable>
            <el-option label="标准产品" value="standard" />
            <el-option label="定制产品" value="custom" />
            <el-option label="组合产品" value="combo" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 168px" clearable>
            <el-option label="已上架" value="on" />
            <el-option label="已下架" value="off" />
            <el-option label="待审核" value="pending" />
            <el-option label="审核拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 360px"
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
          <span>产品列表</span>
          <div class="right">
            <el-button type="primary" :icon="Plus" @click="handleAdd">新增产品</el-button>
            <el-button type="success" :icon="Download" @click="handleExport">导出Excel</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="productCode" label="产品编码" width="120" />
        <el-table-column prop="productName" label="产品名称" width="200">
          <template #default="scope">
            <div class="product-info">
              <el-image
                :src="scope.row.image"
                :preview-src-list="[scope.row.image]"
                fit="cover"
                class="product-image"
              />
              <span>{{ scope.row.productName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="merchantName" label="商户名称" width="150" />
        <el-table-column prop="productType" label="产品类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeType(scope.row.productType)">
              {{ getTypeText(scope.row.productType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="产品价格" width="120">
          <template #default="scope">
            ¥ {{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="commission" label="佣金比例" width="120">
          <template #default="scope">
            {{ scope.row.commission }}%
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="100" />
        <el-table-column prop="status" label="产品状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button
              v-if="scope.row.status === 'on'"
              type="danger"
              link
              :icon="TakeawayBox"
              @click="handleOffline(scope.row)"
            >
              下架
            </el-button>
            <el-button
              v-if="scope.row.status === 'off'"
              type="success"
              link
              :icon="Sell"
              @click="handleOnline(scope.row)"
            >
              上架
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, Download, Edit, Delete, Plus, TakeawayBox, Sell, ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单数据
const searchForm = reactive({
  merchantName: '',
  productName: '',
  productCode: '',
  productType: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    productCode: 'P202403150001',
    productName: '标准支付产品A',
    merchantName: '测试商户A',
    productType: 'standard',
    price: 999.00,
    commission: 0.6,
    sales: 1280,
    status: 'on',
    image: 'https://example.com/product-a.jpg',
    createTime: '2024-03-15 10:00:00',
    updateTime: '2024-03-15 10:00:00'
  },
  {
    productCode: 'P202403150002',
    productName: '定制支付方案B',
    merchantName: '测试商户B',
    productType: 'custom',
    price: 1999.00,
    commission: 0.8,
    sales: 560,
    status: 'off',
    image: 'https://example.com/product-b.jpg',
    createTime: '2024-03-15 09:30:00',
    updateTime: '2024-03-15 15:30:00'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 产品类型映射
const getTypeType = (type) => {
  const map = {
    standard: '',
    custom: 'warning',
    combo: 'success'
  }
  return map[type]
}

const getTypeText = (type) => {
  const map = {
    standard: '标准产品',
    custom: '定制产品',
    combo: '组合产品'
  }
  return map[type]
}

// 状态映射
const getStatusType = (status) => {
  const map = {
    on: 'success',
    off: 'info',
    pending: 'warning',
    rejected: 'danger'
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    on: '已上架',
    off: '已下架',
    pending: '待审核',
    rejected: '审核拒绝'
  }
  return map[status]
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    merchantName: '',
    productName: '',
    productCode: '',
    productType: '',
    status: '',
    dateRange: []
  })
}

// 导出
const handleExport = () => {
  ElMessage.success('产品数据导出成功')
}

// 新增产品
const handleAdd = () => {
  console.log('新增产品')
}

// 编辑产品
const handleEdit = (row) => {
  console.log('编辑产品：', row)
}

// 下架产品
const handleOffline = (row) => {
  ElMessageBox.confirm(
    '确认要下架该产品吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    console.log('下架产品：', row)
    ElMessage.success('产品已下架')
  }).catch(() => {})
}

// 上架产品
const handleOnline = (row) => {
  ElMessageBox.confirm(
    '确认要上架该产品吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    console.log('上架产品：', row)
    ElMessage.success('产品已上架')
  }).catch(() => {})
}

// 删除产品
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确认要删除该产品吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    console.log('删除产品：', row)
    ElMessage.success('产品已删除')
  }).catch(() => {})
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
.merchant-products {
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

.product-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-image {
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